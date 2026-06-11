import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  refreshQueue = []
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, schoolId } = useAuthStore.getState()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (schoolId) {
    config.headers['X-School-ID'] = schoolId
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    const { refreshToken, setTokens, logout } = useAuthStore.getState()

    if (!refreshToken) {
      await logout()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<{
        accessToken: string
        refreshToken: string
      }>(`${API_BASE_URL}/auth/refresh`, { refreshToken })

      setTokens(data.accessToken, data.refreshToken)
      processQueue(null, data.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      await logout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string
      errors?: string[] | Record<string, string>
      missing?: string[]
      missingFields?: string[]
      missingParameters?: string[]
      requiredFields?: string[]
      details?: Record<string, string>
    } | undefined

    if (data?.message) {
      const extra =
        data.missing ??
        data.missingFields ??
        data.missingParameters ??
        data.requiredFields
      if (extra?.length) {
        return `${data.message}: ${extra.join(', ')}`
      }
      if (data.errors) {
        if (Array.isArray(data.errors)) {
          return `${data.message}: ${data.errors.join(', ')}`
        }
        const fieldErrors = Object.entries(data.errors)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        if (fieldErrors) return `${data.message}: ${fieldErrors}`
      }
      return data.message
    }

    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

import axios from 'axios'
import type { LoginCredentials, LoginResponse } from '@/types/auth'
import { useAuthStore } from '@/stores/auth-store'
import { getErrorMessage } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const payload: Record<string, string> = {
      password: credentials.password.trim(),
    }

    if (credentials.email?.trim()) {
      payload.email = credentials.email.trim()
    } else if (credentials.username?.trim()) {
      payload.username = credentials.username.trim()
    }

    const { data } = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!data.success || !data.accessToken) {
      throw new Error(data.message ?? 'Authentication failed')
    }

    return data
  } catch (error) {
    const message = getErrorMessage(error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error(
        message && message !== 'Request failed with status code 401'
          ? `${message} Check username/email and password, or sign in with an account on this API server.`
          : 'Invalid credentials. Check username/email and password.',
      )
    }
    throw new Error(message)
  }
}

export async function logout(accessToken: string | null): Promise<void> {
  if (!accessToken) return

  const { schoolId } = useAuthStore.getState()

  try {
    await axios.delete(`${API_BASE_URL}/notifications/fcm-token/current`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(schoolId ? { 'X-School-ID': schoolId } : {}),
      },
    })
  } catch {
    // FCM deregistration is optional on logout
  }
}

import axios from 'axios'

export interface ApiErrorDetails {
  status?: number
  message: string
  body: unknown
  url?: string
}

export function getApiErrorDetails(error: unknown): ApiErrorDetails | null {
  if (!axios.isAxiosError(error)) return null

  const data = error.response?.data
  const message =
    data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
      ? data.message
      : error.message

  return {
    status: error.response?.status,
    message,
    body: data,
    url: error.config?.url,
  }
}

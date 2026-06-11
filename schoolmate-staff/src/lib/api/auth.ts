import axios from 'axios'
import type { LoginCredentials, LoginResponse } from '@/types/auth'
import { useAuthStore } from '@/stores/auth-store'
import { getErrorMessage } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const payload: Record<string, string> = {
      password: credentials.password,
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
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error(
        'Invalid credentials. Use Email vs Username correctly and verify your password.',
      )
    }
    throw new Error(getErrorMessage(error))
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

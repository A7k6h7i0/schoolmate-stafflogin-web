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

    if (credentials.email) {
      payload.email = credentials.email
    } else if (credentials.username) {
      payload.username = credentials.username
    }

    const { data } = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': credentials.schoolId,
      },
    })

    if (!data.success || !data.accessToken) {
      throw new Error(data.message ?? 'Authentication failed')
    }

    return data
  } catch (error) {
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

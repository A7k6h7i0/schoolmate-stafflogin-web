import { apiClient } from './client'
import { unwrapData } from './helpers'

export async function registerFcmToken(token: string) {
  const { data } = await apiClient.post('/notifications/fcm-token', { token })
  return unwrapData(data)
}

export async function deregisterFcmToken(token: string) {
  const { data } = await apiClient.delete(`/notifications/fcm-token/${encodeURIComponent(token)}`)
  return unwrapData(data)
}

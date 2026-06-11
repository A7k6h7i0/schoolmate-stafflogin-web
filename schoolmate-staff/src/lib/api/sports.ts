import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { Sport } from '@/types/entities'

function normalizeSport(raw: Record<string, unknown>): Sport {
  const id = raw.id ?? raw._id ?? raw.sportId
  return {
    id: id != null ? String(id) : '',
    name: String(raw.activityName ?? raw.name ?? 'Unnamed sport'),
    description: raw.description != null ? String(raw.description) : undefined,
    coachName:
      raw.coachName != null
        ? String(raw.coachName)
        : raw.instructorName != null
          ? String(raw.instructorName)
          : undefined,
    maxParticipants: typeof raw.maxParticipants === 'number' ? raw.maxParticipants : undefined,
  }
}

export async function listSports() {
  const { data } = await apiClient.get('/sports')
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map(normalizeSport).filter((s) => s.id)
}

export async function getSport(id: string) {
  const { data } = await apiClient.get(`/sports/${id}`)
  return unwrapData<Sport>(data)
}

export async function createSport(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/sports', payload)
  return unwrapData<Sport>(data)
}

export async function updateSport(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put(`/sports/${id}`, payload)
  return unwrapData<Sport>(data)
}

export async function deleteSport(id: string) {
  await apiClient.delete(`/sports/${id}`)
}

export async function assignStudent(sportId: string, studentId: string) {
  const { data } = await apiClient.post(`/sports/${sportId}/assign`, { studentId })
  return unwrapData(data)
}

export async function unassignStudent(sportId: string, studentId: string) {
  const { data } = await apiClient.post(`/sports/${sportId}/unassign`, { studentId })
  return unwrapData(data)
}

import { apiClient } from './client'
import { unwrapData, unwrapList, type PageParams } from './helpers'
import type { Student } from '@/types/entities'

export async function listStudents(params?: PageParams & { classId?: string; sectionId?: string }) {
  const { data } = await apiClient.get('/students', { params })
  return unwrapList<Student>(data)
}

export async function getStudent(id: string) {
  const { data } = await apiClient.get(`/students/${id}`)
  return unwrapData<Student>(data)
}

export async function createStudent(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/students', payload)
  return unwrapData<Student>(data)
}

export async function updateStudent(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put(`/students/${id}`, payload)
  return unwrapData<Student>(data)
}

export async function deleteStudent(id: string) {
  await apiClient.delete(`/students/${id}`)
}

export async function updateStudentParent(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put(`/students/${id}/parent`, payload)
  return unwrapData(data)
}

export async function getStudentIdCard(id: string) {
  const { data } = await apiClient.get(`/students/${id}/id-card`)
  return unwrapData(data)
}

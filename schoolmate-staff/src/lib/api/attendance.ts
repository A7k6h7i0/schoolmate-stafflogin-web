import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { LeaveRequest } from '@/types/entities'

export async function recordAttendance(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/attendance/record', payload)
  return unwrapData(data)
}

export async function getStudentAttendance(studentId: string) {
  const { data } = await apiClient.get(`/attendance/student/${studentId}`)
  return unwrapData(data)
}

export async function getClassAttendance(classId: string) {
  const { data } = await apiClient.get(`/attendance/class/${classId}`)
  return unwrapData(data)
}

export async function getAttendanceReports(params?: { month?: string; term?: string }) {
  const { data } = await apiClient.get('/attendance/reports', { params })
  return unwrapData(data)
}

export async function listLeaves() {
  const { data } = await apiClient.get('/attendance/leaves')
  return unwrapList<LeaveRequest>(data).items
}

export async function submitLeave(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/attendance/leaves', payload)
  return unwrapData(data)
}

export async function updateLeaveStatus(id: string, status: 'APPROVED' | 'REJECTED') {
  const { data } = await apiClient.patch(`/attendance/leaves/${id}/status`, { status })
  return unwrapData(data)
}

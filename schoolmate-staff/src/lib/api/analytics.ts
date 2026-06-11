import { apiClient } from './client'
import { unwrapData } from './helpers'

export interface DashboardKpis {
  totalStudents?: number
  totalTeachers?: number
  attendanceRate?: number
  feeCollectionToday?: number
  pendingLeaves?: number
  activeRoutes?: number
  overdueBooks?: number
}

export async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await apiClient.get('/analytics/school-dashboard')
  const payload = data as Record<string, unknown>
  if (payload.data && typeof payload.data === 'object') {
    return payload.data as DashboardKpis
  }
  return payload as DashboardKpis
}

export async function fetchStudentPerformance(studentId: string) {
  const { data } = await apiClient.get(`/analytics/student-performance/${studentId}`)
  return unwrapData(data)
}

export async function fetchTeacherPerformance(teacherId: string) {
  const { data } = await apiClient.get(`/analytics/teacher-performance/${teacherId}`)
  return unwrapData(data)
}

import { apiClient } from './client'
import { unwrapData } from './helpers'

export interface DashboardKpis {
  totalStudents?: number
  totalTeachers?: number
  totalClasses?: number
  attendanceRate?: number
  outstandingFees?: number
  pendingLeaves?: number
  activeRoutes?: number
  overdueBooks?: number
  totalLibraryBooks?: number
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isNaN(n) ? undefined : n
  }
  return undefined
}

/** Map live API + swagger field names into a single KPI shape. */
export function normalizeDashboardKpis(payload: unknown): DashboardKpis {
  if (!payload || typeof payload !== 'object') return {}

  const root = payload as Record<string, unknown>
  const stats =
    root.statistics && typeof root.statistics === 'object'
      ? (root.statistics as Record<string, unknown>)
      : unwrapData<Record<string, unknown>>(payload) ?? root

  return {
    totalStudents: toNumber(stats.totalStudents),
    totalTeachers: toNumber(stats.totalTeachers ?? stats.activeStaff),
    totalClasses: toNumber(stats.totalClasses),
    attendanceRate: toNumber(stats.attendanceRate ?? stats.attendanceToday),
    outstandingFees: toNumber(stats.outstandingFees ?? stats.feeCollectionToday),
    pendingLeaves: toNumber(stats.pendingLeaves),
    activeRoutes: toNumber(stats.activeRoutes ?? stats.totalTransportRoutes),
    overdueBooks: toNumber(stats.overdueBooks),
    totalLibraryBooks: toNumber(stats.totalLibraryBooks),
  }
}

export async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await apiClient.get('/analytics/school-dashboard')
  return normalizeDashboardKpis(data)
}

export async function fetchStudentPerformance(studentId: string) {
  const { data } = await apiClient.get(`/analytics/student-performance/${studentId}`)
  return unwrapData(data)
}

export async function fetchTeacherPerformance(teacherId: string) {
  const { data } = await apiClient.get(`/analytics/teacher-performance/${teacherId}`)
  return unwrapData(data)
}

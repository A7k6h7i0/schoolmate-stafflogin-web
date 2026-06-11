import axios from 'axios'
import { apiClient } from './client'
import { unwrapList } from './helpers'

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

export interface DashboardKpiResult {
  kpis: DashboardKpis
  /** True when school-dashboard analytics API is not allowed for this role. */
  restrictedAccess: boolean
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isNaN(n) ? undefined : n
  }
  return undefined
}

function unwrapDataRecord(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data: unknown }).data
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, unknown>
    }
  }
  if (payload && typeof payload === 'object') {
    return payload as Record<string, unknown>
  }
  return {}
}

/** Map live API + swagger field names into a single KPI shape. */
export function normalizeDashboardKpis(payload: unknown): DashboardKpis {
  if (!payload || typeof payload !== 'object') return {}

  const root = payload as Record<string, unknown>
  const stats =
    root.statistics && typeof root.statistics === 'object'
      ? (root.statistics as Record<string, unknown>)
      : unwrapDataRecord(payload) ?? root

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

async function fetchSchoolDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await apiClient.get('/analytics/school-dashboard')
  return normalizeDashboardKpis(data)
}

/** Build KPIs from module list endpoints when analytics dashboard is forbidden. */
async function fetchDashboardKpisFromModules(): Promise<DashboardKpis> {
  const [studentsRes, classesRes, routesRes, booksRes] = await Promise.all([
    apiClient.get('/students', { params: { limit: 1 } }),
    apiClient.get('/classes'),
    apiClient.get('/transport/routes', { params: { limit: 1 } }),
    apiClient.get('/library/books', { params: { limit: 1 } }),
  ])

  const students = unwrapList(studentsRes.data)
  const classes = unwrapList(classesRes.data)
  const routes = unwrapList(routesRes.data)
  const books = unwrapList(booksRes.data)

  return {
    totalStudents: students.meta?.total ?? students.items.length,
    totalClasses: classes.items.length,
    activeRoutes: routes.meta?.total ?? routes.items.length,
    totalLibraryBooks: books.meta?.total ?? books.items.length,
  }
}

export async function fetchDashboardKpis(): Promise<DashboardKpiResult> {
  try {
    const kpis = await fetchSchoolDashboardKpis()
    return { kpis, restrictedAccess: false }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      const kpis = await fetchDashboardKpisFromModules()
      return { kpis, restrictedAccess: true }
    }
    throw error
  }
}

export async function fetchStudentPerformance(studentId: string) {
  const { data } = await apiClient.get(`/analytics/student-performance/${studentId}`)
  const payload = data as Record<string, unknown>
  if (payload.data) return payload.data
  return data
}

export async function fetchTeacherPerformance(teacherId: string) {
  const { data } = await apiClient.get(`/analytics/teacher-performance/${teacherId}`)
  const payload = data as Record<string, unknown>
  if (payload.data) return payload.data
  return data
}

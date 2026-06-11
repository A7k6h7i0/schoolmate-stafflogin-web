import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { Employee, PayrollRecord } from '@/types/entities'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value)
  }
  return undefined
}

function splitFullName(full: string): { firstName: string; lastName: string } {
  const trimmed = full.trim()
  if (!trimmed) return { firstName: '', lastName: '' }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function flattenEmployeeSource(raw: Record<string, unknown>): Record<string, unknown> {
  const nestedSources = [
    asRecord(raw.user),
    asRecord(raw.profile),
    asRecord(raw.employee),
    asRecord(raw.employeeProfile),
    asRecord(raw.userDetails),
    asRecord(raw.account),
    typeof raw.userId === 'object' ? asRecord(raw.userId) : null,
  ].filter(Boolean) as Record<string, unknown>[]

  const merged: Record<string, unknown> = { ...raw }
  for (const nested of nestedSources) {
    Object.assign(merged, nested)
  }
  return merged
}

export function normalizeEmployee(raw: Record<string, unknown>): Employee {
  const merged = flattenEmployeeSource(raw)
  const userIdRecord = typeof raw.userId === 'object' ? asRecord(raw.userId) : null

  const fullName = pickString(
    merged.fullName,
    merged.full_name,
    merged.name,
    merged.employeeName,
    raw.name,
    raw.employeeName,
  )
  const fromName = splitFullName(fullName)

  const firstName = pickString(merged.firstName, merged.first_name, merged.givenName, fromName.firstName)
  const lastName = pickString(merged.lastName, merged.last_name, merged.familyName, fromName.lastName)

  const userId =
    typeof raw.userId === 'string'
      ? raw.userId.trim()
      : pickString(userIdRecord?.id, userIdRecord?._id, merged.userId)

  const profileId = pickString(raw.id, raw._id, raw.employeeId, merged.employeeId)
  const userAccountId = pickString(merged.id, merged._id, userIdRecord?.id, userIdRecord?._id)

  const id = userId || userAccountId || profileId

  return {
    id: id ? String(id) : '',
    email: pickString(merged.email, merged.emailAddress, merged.mail),
    username: pickString(merged.username, merged.userName) || undefined,
    firstName,
    lastName,
    name: fullName || undefined,
    role: pickString(merged.role, merged.employeeRole, raw.role),
    phone: pickString(merged.phone, merged.phoneNumber, merged.mobile) || undefined,
    baseSalary: pickNumber(raw.baseSalary, merged.baseSalary, merged.salary, merged.monthlySalary),
    status: pickString(merged.status) || undefined,
  }
}

export function formatEmployeeName(employee: Employee): string {
  const parts = [employee.firstName, employee.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  if (employee.name) return employee.name
  if (employee.username) return employee.username
  if (employee.email) return employee.email
  return '—'
}

export function formatEmployeeEmail(employee: Employee): string {
  return employee.email || employee.username || '—'
}

function unwrapEmployeeEntity(payload: unknown): Record<string, unknown> {
  const data = unwrapData<unknown>(payload)
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    for (const key of ['employee', 'user', 'profile', 'record']) {
      if (record[key] && typeof record[key] === 'object') {
        return { ...record, ...(record[key] as Record<string, unknown>) }
      }
    }
    return record
  }
  return {}
}

async function enrichEmployeeFromDetail(raw: Record<string, unknown>, partial: Employee): Promise<Employee> {
  const lookupId = pickString(
    typeof raw.userId === 'string' ? raw.userId : undefined,
    raw.id,
    raw._id,
    partial.id,
  )
  if (!lookupId) return partial

  try {
    const { data } = await apiClient.get(`/hr/employees/${lookupId}`)
    const detail = unwrapEmployeeEntity(data)
    return normalizeEmployee({ ...raw, ...detail })
  } catch {
    return partial
  }
}

export async function listEmployees(params?: { role?: string; page?: number; limit?: number }) {
  const { data } = await apiClient.get('/hr/employees', { params })
  const result = unwrapList<Record<string, unknown>>(data)
  const rawItems = result.items

  let items = rawItems.map(normalizeEmployee).filter((employee) => employee.id)

  const sparse = items.filter((employee) => !employee.firstName && !employee.email)
  if (sparse.length > 0) {
    const rawById = new Map<string, Record<string, unknown>>()
    for (const raw of rawItems) {
      const normalized = normalizeEmployee(raw)
      if (normalized.id) rawById.set(normalized.id, raw)
    }

    const enriched = await Promise.all(
      sparse.map(async (employee) => {
        const raw = rawById.get(employee.id) ?? {}
        return enrichEmployeeFromDetail(raw, employee)
      }),
    )

    const enrichedById = new Map(enriched.map((employee) => [employee.id, employee]))
    items = items.map((employee) => enrichedById.get(employee.id) ?? employee)
  }

  if (import.meta.env.DEV && rawItems.length > 0) {
    console.info('[hr] GET /hr/employees raw sample', rawItems[0])
    console.info('[hr] GET /hr/employees normalized', items)
  }

  return { items, meta: result.meta }
}

export async function getEmployee(id: string) {
  const { data } = await apiClient.get(`/hr/employees/${id}`)
  return normalizeEmployee(unwrapEmployeeEntity(data))
}

export async function createEmployee(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/hr/employees', payload)
  return normalizeEmployee(unwrapEmployeeEntity(data))
}

export async function updateEmployee(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put(`/hr/employees/${id}`, payload)
  return normalizeEmployee(unwrapEmployeeEntity(data))
}

export async function calculatePayroll(payload: { month: string; year: number }) {
  const { data } = await apiClient.post('/hr/payroll/calculate', payload)
  return unwrapData(data)
}

export async function markPayrollPaid(id: string) {
  const { data } = await apiClient.patch(`/hr/payroll/${id}/pay`)
  return unwrapData(data)
}

export async function getPayrollHistory(params?: { employeeId?: string }) {
  const { data } = await apiClient.get('/hr/payroll/history', { params })
  return unwrapList<PayrollRecord>(data).items
}

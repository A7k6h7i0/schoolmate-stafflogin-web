import type { ApiListResult, PaginatedMeta } from '@/types/api'

const LIST_ARRAY_KEYS = [
  'items',
  'data',
  'classes',
  'sections',
  'records',
  'results',
  'list',
  'rows',
  'students',
  'subjects',
  'exams',
  'employees',
  'books',
  'routes',
  'vehicles',
  'drivers',
  'announcements',
  'meetings',
  'invoices',
  'sports',
  'homework',
] as const

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

function findArrayInRecord(record: Record<string, unknown>): unknown[] | null {
  for (const key of LIST_ARRAY_KEYS) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[]
    }
  }
  return null
}

function findArrayDeep(payload: unknown, depth = 0): unknown[] | null {
  if (depth > 4 || payload == null) return null

  if (Array.isArray(payload)) {
    return payload
  }

  if (typeof payload !== 'object') return null

  const record = payload as Record<string, unknown>
  const direct = findArrayInRecord(record)
  if (direct) return direct

  if ('data' in record) {
    const nested = findArrayDeep(record.data, depth + 1)
    if (nested) return nested
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value) && value.length > 0) {
      return value
    }
  }

  return null
}

export function unwrapList<T>(payload: unknown): ApiListResult<T> {
  const array = findArrayDeep(payload)

  if (array) {
    const root = payload as Record<string, unknown>
    const data = unwrapData<unknown>(payload)
    const metaSource =
      data && typeof data === 'object' && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : root

    const meta =
      metaSource && typeof metaSource === 'object' && 'meta' in metaSource
        ? (metaSource.meta as PaginatedMeta)
        : undefined

    return { items: array as T[], meta }
  }

  return { items: [] }
}

export function unwrapEntity<T>(payload: unknown): T {
  const data = unwrapData<unknown>(payload)

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    for (const key of ['class', 'section', 'student', 'subject', 'record', 'item']) {
      if (record[key] && typeof record[key] === 'object') {
        return record[key] as T
      }
    }
  }

  return data as T
}

export interface PageParams {
  page?: number
  limit?: number
}

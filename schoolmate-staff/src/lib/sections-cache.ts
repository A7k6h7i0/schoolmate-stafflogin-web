import type { Section } from '@/types/entities'
import { useAuthStore } from '@/stores/auth-store'

const STORAGE_KEY = 'schoolmate-sections-cache'

type SectionStore = Record<string, Section[]>

function cacheKey(schoolId: string, classId: string) {
  return `${schoolId}:${classId}`
}

function readStore(): SectionStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SectionStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: SectionStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getCachedSections(classId: string): Section[] {
  const schoolId = useAuthStore.getState().schoolId
  if (!schoolId || !classId) return []
  return readStore()[cacheKey(schoolId, classId)] ?? []
}

export function persistSection(classId: string, section: Section) {
  const schoolId = useAuthStore.getState().schoolId
  if (!schoolId || !classId || !section.id) return

  const store = readStore()
  const key = cacheKey(schoolId, classId)
  const existing = store[key] ?? []
  store[key] = [...existing.filter((s) => s.id !== section.id), section]
  writeStore(store)
}

export function mergeSections(classId: string, sections: Section[]): Section[] {
  const cached = getCachedSections(classId)
  const merged = [...sections]
  cached.forEach((section) => {
    if (!merged.some((s) => s.id === section.id)) {
      merged.push(section)
    }
  })
  return merged
}

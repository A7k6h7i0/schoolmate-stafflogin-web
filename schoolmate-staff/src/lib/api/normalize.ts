import type { ClassLevel, Section } from '@/types/entities'

export function normalizeId(record: Record<string, unknown>): string {
  const id = record.id ?? record._id
  return id != null ? String(id) : ''
}

/** Resolve a MongoDB ref field that may be an id string or a populated document. */
export function extractPopulatedRef(
  raw: Record<string, unknown>,
  fieldKeys: string[],
): { id?: string; label?: string } {
  for (const key of fieldKeys) {
    const value = raw[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>
      const id = record.id ?? record._id ?? record.classId
      const label = record.className ?? record.name ?? record.title ?? record.label
      return {
        id: id != null ? String(id) : undefined,
        label: label != null ? String(label) : undefined,
      }
    }
    if (typeof value === 'string' && value.trim()) {
      return { id: value.trim() }
    }
  }
  return {}
}

export function normalizeSection(raw: Record<string, unknown>): Section {
  const id = raw.id ?? raw._id ?? raw.sectionId
  const name = String(raw.sectionName ?? raw.name ?? raw.section ?? 'Unnamed section')
  return {
    id: id != null ? String(id) : '',
    name,
    classId: raw.classId != null ? String(raw.classId) : undefined,
  }
}

/** Extract section from varied POST /classes/{id}/sections response shapes. */
export function extractSectionFromResponse(payload: unknown): Section | null {
  if (!payload || typeof payload !== 'object') return null

  const record = payload as Record<string, unknown>

  if (record.sectionName != null || record.sectionId != null) {
    const section = normalizeSection(record)
    return section.id ? section : null
  }

  if (record.section && typeof record.section === 'object') {
    const section = normalizeSection(record.section as Record<string, unknown>)
    return section.id ? section : null
  }

  if (Array.isArray(record.sections) && record.sections.length > 0) {
    const last = record.sections[record.sections.length - 1] as Record<string, unknown>
    const section = normalizeSection(last)
    return section.id ? section : null
  }

  return null
}

function extractSectionsFromRaw(raw: Record<string, unknown>): Section[] | undefined {
  const arrayKeys = ['sections', 'classSections', 'sectionList', 'classSectionList']
  for (const key of arrayKeys) {
    if (Array.isArray(raw[key])) {
      return (raw[key] as Record<string, unknown>[]).map(normalizeSection).filter((s) => s.id)
    }
  }
  return undefined
}

export function normalizeClass(raw: Record<string, unknown>): ClassLevel {
  let sections = extractSectionsFromRaw(raw)

  const classId = raw.id ?? raw._id ?? raw.classId
  return {
    id: classId != null ? String(classId) : '',
    name: String(raw.className ?? raw.name ?? 'Unnamed class'),
    gradeLevel: typeof raw.gradeLevel === 'number' ? raw.gradeLevel : undefined,
    sections,
  }
}

export function mergeSectionIntoClasses(
  classes: ClassLevel[],
  classId: string,
  section: Section,
): ClassLevel[] {
  return classes.map((c) => {
    if (c.id !== classId) return c
    const existing = c.sections ?? []
    if (existing.some((s) => s.id === section.id)) return c
    return { ...c, sections: [...existing, section] }
  })
}

export function upsertClass(classes: ClassLevel[], classItem: ClassLevel): ClassLevel[] {
  if (!classItem.id) return classes
  const index = classes.findIndex((c) => c.id === classItem.id)
  if (index === -1) return [...classes, classItem]
  const next = [...classes]
  next[index] = { ...next[index], ...classItem, sections: classItem.sections ?? next[index].sections }
  return next
}

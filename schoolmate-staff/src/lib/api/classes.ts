import { apiClient } from './client'
import { unwrapData, unwrapEntity, unwrapList } from './helpers'
import { mergeSections, persistSection } from '@/lib/sections-cache'
import { extractSectionFromResponse, normalizeClass, normalizeSection } from './normalize'
import type { ClassLevel, Section, Subject, Homework, Exam } from '@/types/entities'

export async function listClassesFromApi(): Promise<ClassLevel[]> {
  const { data } = await apiClient.get('/classes')
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map((item) => normalizeClass(item)).filter((c) => c.id)
}

/** Keeps sections from cache when GET /classes omits nested sections. */
export function mergeClassLists(fresh: ClassLevel[], previous: ClassLevel[]): ClassLevel[] {
  if (!previous.length) return fresh

  return fresh.map((c) => {
    const prev = previous.find((p) => p.id === c.id)
    if (prev?.sections?.length && !c.sections?.length) {
      return { ...c, sections: prev.sections }
    }
    return c
  })
}

export async function listClasses(previous?: ClassLevel[]): Promise<ClassLevel[]> {
  const fresh = await listClassesFromApi()
  const merged = mergeClassLists(fresh, previous ?? [])
  return merged.map((c) => ({
    ...c,
    sections: mergeSections(c.id, c.sections ?? []),
  }))
}

/** API has POST /classes/{id}/sections only — no GET list endpoint. */
export function getSectionsForClass(classId: string, classes: ClassLevel[]): Section[] {
  const cls = classes.find((c) => c.id === classId)
  return mergeSections(classId, cls?.sections ?? [])
}

/** Reconcile section id from server class list (embedded sections) before student POST. */
export async function resolveClassSectionIds(
  classId: string,
  sectionId: string,
  sectionName?: string,
): Promise<{ classId: string; sectionId: string } | null> {
  const classes = await listClassesFromApi()
  const cls = classes.find((c) => c.id === classId)
  if (!cls) return null

  const sections = mergeSections(classId, cls.sections ?? [])
  let section = sections.find((s) => s.id === sectionId)
  if (!section && sectionName) {
    section = sections.find(
      (s) => s.name.toLowerCase() === sectionName.toLowerCase() || s.name === sectionName,
    )
  }
  if (!section?.id) return null

  persistSection(classId, section)
  return { classId, sectionId: section.id }
}

export async function createClass(payload: { name: string; gradeLevel?: number }) {
  const body: Record<string, unknown> = { className: payload.name }
  if (payload.gradeLevel != null && !Number.isNaN(payload.gradeLevel)) {
    body.gradeLevel = payload.gradeLevel
  }

  const { data } = await apiClient.post('/classes', body)
  const raw = unwrapEntity<Record<string, unknown>>(data)
  return normalizeClass(raw)
}

export async function createSection(classId: string, payload: { name: string }) {
  const { data } = await apiClient.post(`/classes/${classId}/sections`, {
    sectionName: payload.name,
  })
  const entity = unwrapEntity<unknown>(data)
  let section =
    extractSectionFromResponse(entity) ??
    extractSectionFromResponse(unwrapData<unknown>(data)) ??
    normalizeSection((entity ?? {}) as Record<string, unknown>)

  // Prefer section id from refreshed GET /classes (embedded sections) when available
  const classes = await listClassesFromApi()
  const cls = classes.find((c) => c.id === classId)
  const fromList = cls?.sections?.find(
    (s) =>
      s.name.toLowerCase() === payload.name.toLowerCase() ||
      s.name === payload.name ||
      (section.id && s.id === section.id),
  )
  if (fromList?.id) {
    section = { ...fromList, classId }
  }

  const resolved = { ...section, classId, id: section.id }
  if (resolved.id) {
    persistSection(classId, resolved)
  }
  return resolved
}

export async function listSubjects() {
  const { data } = await apiClient.get('/subjects')
  return unwrapList<Subject>(data).items
}

export async function createSubject(payload: { name: string; code?: string; description?: string }) {
  const { data } = await apiClient.post('/subjects', payload)
  return unwrapEntity<Subject>(data)
}

export async function linkSubjectToSection(
  classId: string,
  sectionId: string,
  payload: { subjectId: string; teacherId: string },
) {
  const { data } = await apiClient.post(
    `/classes/${classId}/sections/${sectionId}/subjects`,
    payload,
  )
  return unwrapEntity(data)
}

export async function createTimetableSlot(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/timetable/slots', payload)
  return unwrapEntity(data)
}

export async function getTimetable(classId: string, sectionId: string) {
  const { data } = await apiClient.get(`/timetable/class/${classId}/section/${sectionId}`)
  return unwrapEntity(data)
}

export async function listHomework(params?: { classId?: string; sectionId?: string }) {
  const { data } = await apiClient.get('/homework', { params })
  return unwrapList<Homework>(data).items
}

export async function createHomework(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/homework', payload)
  return unwrapEntity<Homework>(data)
}

export async function listExams() {
  const { data } = await apiClient.get('/exams')
  return unwrapList<Exam>(data).items
}

export async function createExam(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/exams', payload)
  return unwrapEntity<Exam>(data)
}

export async function createExamSchedule(examId: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/exams/${examId}/schedules`, payload)
  return unwrapEntity(data)
}

export async function submitExamMarks(scheduleId: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/exams/schedules/${scheduleId}/marks`, payload)
  return unwrapEntity(data)
}

export async function getReportCard(studentId: string) {
  const { data } = await apiClient.get(`/exams/report-card/student/${studentId}`)
  return unwrapEntity(data)
}

import { apiClient } from './client'
import { unwrapData } from './helpers'

export async function importStudents(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post('/data/import/students', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(data)
}

export async function exportStudents() {
  const { data } = await apiClient.get('/data/export/students', { responseType: 'blob' })
  return data as Blob
}

export async function exportFinances() {
  const { data } = await apiClient.get('/data/export/finances', { responseType: 'blob' })
  return data as Blob
}

export async function triggerBackup() {
  const { data } = await apiClient.post('/data/system/backup')
  return unwrapData(data)
}

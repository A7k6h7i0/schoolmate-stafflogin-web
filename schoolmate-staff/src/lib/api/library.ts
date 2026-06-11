import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { Book, BookIssue } from '@/types/entities'
import { buildCreateBookPayload, type CreateBookForm } from '@/lib/library-form'

function normalizeBook(raw: Record<string, unknown>): Book {
  const id = raw.id ?? raw._id ?? raw.bookId
  return {
    id: id != null ? String(id) : '',
    title: String(raw.title ?? 'Untitled'),
    author: raw.author != null ? String(raw.author) : undefined,
    isbn: raw.isbn != null ? String(raw.isbn) : undefined,
    category: raw.category != null ? String(raw.category) : undefined,
    totalCopies:
      typeof raw.totalCopies === 'number'
        ? raw.totalCopies
        : typeof raw.copies === 'number'
          ? raw.copies
          : undefined,
    availableCopies:
      typeof raw.availableCopies === 'number'
        ? raw.availableCopies
        : typeof raw.available === 'number'
          ? raw.available
          : undefined,
    status: raw.status != null ? String(raw.status) : undefined,
  }
}

export async function listBooks(params?: { search?: string }) {
  const { data } = await apiClient.get('/library/books', { params })
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map(normalizeBook).filter((book) => book.id)
}

export async function createBook(form: CreateBookForm) {
  const payload = buildCreateBookPayload(form)
  if (import.meta.env.DEV) {
    console.info('[library] POST /library/books', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/library/books', payload)
  return unwrapData<Book>(data)
}

export async function updateBook(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put(`/library/books/${id}`, payload)
  return unwrapData<Book>(data)
}

export async function deleteBook(id: string) {
  await apiClient.delete(`/library/books/${id}`)
}

export async function issueBook(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/library/issues', payload)
  return unwrapData(data)
}

export async function listIssues() {
  const { data } = await apiClient.get('/library/issues')
  return unwrapList<BookIssue>(data).items
}

export async function returnBook(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/library/returns', payload)
  return unwrapData(data)
}

export async function listOverdue() {
  const { data } = await apiClient.get('/library/issues/overdue')
  return unwrapList<BookIssue>(data).items
}

export async function payFine(id: string) {
  const { data } = await apiClient.post(`/library/fines/${id}/pay`)
  return unwrapData(data)
}

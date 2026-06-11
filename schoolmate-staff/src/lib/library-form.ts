import { z } from 'zod'

export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  isbn: z.string().trim().min(1, 'ISBN is required'),
  barcode: z.string().trim().min(1, 'Barcode is required'),
  author: z.string().optional(),
  category: z.string().optional(),
  rackLocation: z.string().optional(),
  totalCopies: z.string().optional(),
})

export type CreateBookForm = z.infer<typeof createBookSchema>

export function suggestBarcode(isbn: string, title: string): string {
  const fromIsbn = isbn.replace(/[^a-zA-Z0-9]/g, '')
  if (fromIsbn.length >= 4) return `LIB-${fromIsbn}`

  const fromTitle = title
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12)
  if (fromTitle.length >= 4) return `LIB-${fromTitle}`

  return `LIB-${Date.now()}`
}

/** Live API requires title, isbn, and barcode (Swagger); copies may be optional. */
export function buildCreateBookPayload(form: CreateBookForm) {
  const title = form.title.trim()
  const isbn = form.isbn.trim()
  const barcode = form.barcode.trim()
  const copies = form.totalCopies ? Number(form.totalCopies) : undefined

  const payload: Record<string, unknown> = {
    title,
    isbn,
    barcode,
  }

  if (form.author?.trim()) payload.author = form.author.trim()
  if (form.category?.trim()) {
    payload.category = form.category.trim()
    payload.rackLocation = form.rackLocation?.trim() || form.category.trim()
  }
  if (form.rackLocation?.trim()) payload.rackLocation = form.rackLocation.trim()

  if (copies != null && !Number.isNaN(copies) && copies > 0) {
    payload.totalCopies = copies
    payload.copies = copies
    payload.quantity = copies
  }

  return payload
}

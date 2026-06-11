import { z } from 'zod'

export const createEmployeeSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username is required (min 3 characters)')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use letters, numbers, dots, hyphens only'),
  email: z.string().trim().email('Enter a valid email'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  role: z.enum(['TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'DRIVER', 'SPORTS']),
  baseSalary: z
    .string()
    .min(1, 'Base salary is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter a valid salary amount'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password is required (min 8 characters) for staff login'),
  department: z.string().optional(),
})

export type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>

export function suggestUsername(email: string, firstName: string, lastName: string): string {
  const fromEmail = email.trim().split('@')[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, '')
  if (fromEmail && fromEmail.length >= 3) return fromEmail

  const fromName = `${firstName.trim()}.${lastName.trim()}`
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9._-]/g, '')
  return fromName.length >= 3 ? fromName : ''
}

export function buildCreateEmployeePayload(form: CreateEmployeeForm) {
  const payload: Record<string, unknown> = {
    username: form.username.trim(),
    email: form.email.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    role: form.role,
    baseSalary: Number(form.baseSalary),
  }

  payload.password = form.password
  if (form.phone?.trim()) payload.phone = form.phone.trim()
  if (form.department?.trim()) payload.department = form.department.trim()

  return payload
}

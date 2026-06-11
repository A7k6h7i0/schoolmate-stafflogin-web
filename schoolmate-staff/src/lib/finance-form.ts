import { z } from 'zod'
import { MONGO_OBJECT_ID } from './students-form'

export function currentAcademicYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  if (month >= 3) return `${year}-${year + 1}`
  return `${year - 1}-${year}`
}

export const createFeeStructureSchema = z.object({
  classId: z.string().regex(MONGO_OBJECT_ID, 'Select a class from the dropdown'),
  academicYear: z
    .string()
    .trim()
    .min(1, 'Academic year is required')
    .regex(/^\d{4}-\d{4}$/, 'Use format e.g. 2025-2026'),
  amount: z
    .string()
    .min(1, 'Fee amount is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  feeInterval: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
})

export type CreateFeeStructureForm = z.infer<typeof createFeeStructureSchema>

/** Live API expects classId, academicYear, and amount; Swagger uses baseFeeAmount + feeInterval. */
export function buildCreateFeeStructurePayload(form: CreateFeeStructureForm) {
  const amount = Number(form.amount)
  const classId = form.classId.trim()
  const academicYear = form.academicYear.trim()
  const feeInterval = form.feeInterval

  return {
    classId,
    academicYear,
    amount,
    baseFeeAmount: amount,
    feeInterval,
    interval: feeInterval,
    paymentInterval: feeInterval,
  }
}

export function buildGenerateYearlyLedgerPayload(academicYear: string) {
  const year = academicYear.trim()
  return {
    academicYear: year,
    year: year.split('-')[0],
  }
}

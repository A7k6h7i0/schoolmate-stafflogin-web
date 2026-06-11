import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'

export const MONGO_OBJECT_ID = /^[a-f0-9]{24}$/i

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((d) => {
      const date = new Date(d)
      return !Number.isNaN(date.getTime()) && date <= new Date()
    }, 'Date of birth cannot be in the future'),
  emergencyContact: z.string().trim().min(1, 'Emergency contact is required'),
  classId: z.string().regex(MONGO_OBJECT_ID, 'Select a valid class from the dropdown'),
  sectionId: z.string().regex(MONGO_OBJECT_ID, 'Select a valid section from the dropdown'),
  fatherName: z.string().trim().min(1, 'Father name is required'),
  motherName: z.string().trim().min(1, 'Mother name is required'),
  primaryPhone: z.string().trim().min(1, 'Parent phone is required'),
  homeAddress: z.string().trim().min(1, 'Home address is required'),
})

export type CreateStudentForm = z.infer<typeof createStudentSchema>

/**
 * POST /students — backend validates the same flat fields as CSV import
 * (fatherName, motherName, primaryPhone, homeAddress at root).
 * Also send parentContact for Swagger-compatible clients.
 */
export function buildCreateStudentPayload(form: CreateStudentForm) {
  const fatherName = form.fatherName.trim()
  const motherName = form.motherName.trim()
  const primaryPhone = form.primaryPhone.trim()
  const homeAddress = form.homeAddress.trim()

  const schoolId = useAuthStore.getState().schoolId

  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
    emergencyContact: form.emergencyContact.trim(),
    classId: form.classId.trim(),
    sectionId: form.sectionId.trim(),
    fatherName,
    motherName,
    primaryPhone,
    homeAddress,
    parentContact: {
      fatherName,
      motherName,
      primaryPhone,
      homeAddress,
    },
    ...(schoolId ? { schoolId } : {}),
  }
}

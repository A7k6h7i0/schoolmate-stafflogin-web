import axios from 'axios'

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  gender: 'Gender',
  dateOfBirth: 'Date of birth',
  emergencyContact: 'Emergency contact',
  classId: 'Class',
  sectionId: 'Section',
  fatherName: 'Father name',
  motherName: 'Mother name',
  primaryPhone: 'Parent phone',
  homeAddress: 'Home address',
  parentContact: 'Parent contact',
}

function mapApiFieldToForm(field: string): string {
  const normalized = field.replace(/^parentContact\./, '')
  if (FIELD_LABELS[normalized]) return normalized
  if (FIELD_LABELS[field]) return field
  return normalized
}

function labelForField(field: string): string {
  return FIELD_LABELS[field] ?? field
}

export function extractFieldErrors(error: unknown): Record<string, string> | null {
  if (!axios.isAxiosError(error)) return null

  const data = error.response?.data as Record<string, unknown> | undefined
  if (!data) return null

  const errors: Record<string, string> = {}

  const missing = (data.missing ??
    data.missingFields ??
    data.missingParameters ??
    data.required ??
    data.requiredFields) as string[] | undefined
  if (Array.isArray(missing)) {
    missing.forEach((field) => {
      const formKey = mapApiFieldToForm(String(field))
      errors[formKey] = `${labelForField(formKey)} is required`
    })
  }

  const details = data.details
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    Object.entries(details as Record<string, string>).forEach(([field, message]) => {
      const formKey = mapApiFieldToForm(field)
      errors[formKey] = message
    })
  }

  const fieldErrors = data.errors
  if (Array.isArray(fieldErrors)) {
    fieldErrors.forEach((item) => {
      if (typeof item === 'string') {
        errors.form = item
      } else if (item && typeof item === 'object') {
        const entry = item as { field?: string; path?: string; message?: string }
        const field = entry.field ?? entry.path
        if (field) {
          const formKey = mapApiFieldToForm(field)
          errors[formKey] = entry.message ?? `${labelForField(formKey)} is invalid`
        }
      }
    })
  } else if (fieldErrors && typeof fieldErrors === 'object') {
    Object.entries(fieldErrors as Record<string, string>).forEach(([field, message]) => {
      const formKey = mapApiFieldToForm(field)
      errors[formKey] = message
    })
  }

  const message = typeof data.message === 'string' ? data.message : ''
  if (
    (message.toLowerCase().includes('missing') || message.toLowerCase().includes('required')) &&
    Object.keys(errors).length === 0
  ) {
    const knownFields = Object.keys(FIELD_LABELS)
    knownFields.forEach((field) => {
      if (message.toLowerCase().includes(field.toLowerCase())) {
        errors[field] = `${labelForField(field)} may be missing or invalid`
      }
    })

    if (Object.keys(errors).length === 0) {
      if (message.toLowerCase().includes('student parameters')) {
        errors.classId = 'Server could not validate class. Re-create in Academics and select again.'
        errors.sectionId = 'Server could not validate section. Re-create in Academics and select again.'
      } else {
        errors.form = message
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}

export function formatFieldErrors(errors: Record<string, string>): string {
  return Object.entries(errors)
    .map(([field, msg]) => `${labelForField(field)}: ${msg}`)
    .join('\n')
}

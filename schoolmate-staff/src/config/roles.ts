import type { StaffRole } from '@/types/auth'

export const ROLE_LABELS: Record<StaffRole, string> = {
  SCHOOL_ADMIN: 'School Admin',
  ACADEMIC_ADMIN: 'Academic Admin',
  TEACHER: 'Teacher',
  ACCOUNTANT: 'Accountant',
  LIBRARIAN: 'Librarian',
  DRIVER: 'Driver',
}

export function isStaffRole(role: string): role is StaffRole {
  return role in ROLE_LABELS
}

export function isSchoolAdmin(role: string | undefined | null): boolean {
  return role === 'SCHOOL_ADMIN'
}

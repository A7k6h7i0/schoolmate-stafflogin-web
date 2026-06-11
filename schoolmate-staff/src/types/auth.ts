export const STAFF_ROLES = [
  'SCHOOL_ADMIN',
  'ACADEMIC_ADMIN',
  'TEACHER',
  'ACCOUNTANT',
  'LIBRARIAN',
  'DRIVER',
] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export type UserRole =
  | StaffRole
  | 'SUPER_ADMIN'
  | 'PARENT'
  | 'STUDENT'

export interface User {
  id: string
  email?: string
  username?: string
  role: UserRole
  firstName?: string
  lastName?: string
  schoolId: string
}

export interface LoginCredentials {
  schoolId: string
  email?: string
  username?: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

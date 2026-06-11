export interface Student {
  id: string
  schoolId?: string
  enrollmentNumber?: string
  firstName: string
  lastName: string
  gender?: string
  dateOfBirth?: string
  classId?: string
  sectionId?: string
  className?: string
  sectionName?: string
  emergencyContact?: string
  bloodGroup?: string
  medicalNotes?: string
  status?: string
  parentContact?: {
    fatherName?: string
    motherName?: string
    primaryPhone?: string
    homeAddress?: string
  }
}

export interface ClassLevel {
  id: string
  name: string
  gradeLevel?: number
  sections?: Section[]
}

export interface Section {
  id: string
  name: string
  classId?: string
}

export interface Subject {
  id: string
  name: string
  code?: string
  description?: string
}

export interface FeeStructure {
  id: string
  classId?: string
  className?: string
  baseFeeAmount: number
  feeInterval: string
  academicYear?: string
}

export interface FeeInvoice {
  id: string
  studentId?: string
  studentName?: string
  amount?: number
  status?: string
  dueDate?: string
  createdAt?: string
}

export interface Employee {
  id: string
  email: string
  username?: string
  firstName: string
  lastName: string
  name?: string
  role: string
  phone?: string
  baseSalary?: number
  status?: string
}

export interface Sport {
  id: string
  name: string
  description?: string
  coachName?: string
  maxParticipants?: number
}

export interface Announcement {
  id: string
  title: string
  body?: string
  content?: string
  audience?: string
  createdAt?: string
}

export interface Book {
  id: string
  title: string
  author?: string
  isbn?: string
  category?: string
  totalCopies?: number
  availableCopies?: number
  status?: string
}

export interface BookIssue {
  id: string
  bookId?: string
  bookTitle?: string
  studentId?: string
  studentName?: string
  issueDate?: string
  dueDate?: string
  status?: string
}

export interface TransportRoute {
  id: string
  name: string
  startPoint?: string
  endPoint?: string
  stops?: string[]
  routeFare?: number
  fare?: number
  status?: string
}

export interface Vehicle {
  id: string
  registrationNumber: string
  capacity?: number
  model?: string
  status?: string
}

export interface Driver {
  id: string
  employeeId?: string
  vehicleId?: string
  name?: string
  licenseNumber?: string
}

export interface Homework {
  id: string
  title: string
  description?: string
  classId?: string
  sectionId?: string
  subjectId?: string
  dueDate?: string
}

export interface Exam {
  id: string
  name: string
  examType?: string
  academicYear?: string
  startDate?: string
  endDate?: string
}

export interface LeaveRequest {
  id: string
  studentId?: string
  studentName?: string
  reason?: string
  startDate?: string
  endDate?: string
  status?: string
}

export interface Meeting {
  id: string
  teacherId?: string
  parentId?: string
  studentId?: string
  scheduledAt?: string
  status?: string
  notes?: string
}

export interface PayrollRecord {
  id: string
  employeeId?: string
  employeeName?: string
  month?: string
  year?: number
  netSalary?: number
  status?: string
}

export interface DailyCashLedger {
  date?: string
  totalCollected?: number
  transactionCount?: number
  entries?: Array<{ studentName?: string; amount?: number; time?: string }>
}

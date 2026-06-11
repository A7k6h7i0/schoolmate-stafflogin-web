import {
  BarChart3,
  Bus,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Database,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageSquare,
  Settings,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { StaffRole } from '@/types/auth'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  module: string
  roles: StaffRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    module: 'Analytics',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER', 'ACCOUNTANT'],
  },
  {
    title: 'Students',
    href: '/students',
    icon: GraduationCap,
    module: 'Module 3',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: CalendarCheck,
    module: 'Module 4',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER'],
  },
  {
    title: 'Academics',
    href: '/academics',
    icon: BookOpen,
    module: 'Module 5',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER'],
  },
  {
    title: 'Sports',
    href: '/sports',
    icon: Trophy,
    module: 'Module 6',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER'],
  },
  {
    title: 'Communication',
    href: '/communication',
    icon: MessageSquare,
    module: 'Module 7',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER'],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: CreditCard,
    module: 'Module 8',
    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],
  },
  {
    title: 'HR & Staff',
    href: '/hr',
    icon: Users,
    module: 'Module 9',
    roles: ['SCHOOL_ADMIN'],
  },
  {
    title: 'Transport',
    href: '/transport',
    icon: Bus,
    module: 'Module 10',
    roles: ['SCHOOL_ADMIN', 'DRIVER'],
  },
  {
    title: 'Library',
    href: '/library',
    icon: Library,
    module: 'Module 11',
    roles: ['SCHOOL_ADMIN', 'LIBRARIAN'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    module: 'Module 12',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'ACCOUNTANT'],
  },
  {
    title: 'Data Operations',
    href: '/data-ops',
    icon: Database,
    module: 'Module 13',
    roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    module: 'Module 14',
    roles: ['SCHOOL_ADMIN', 'ACADEMIC_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'DRIVER'],
  },
]

export function getNavItemsForRole(role: StaffRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

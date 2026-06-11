import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  BookOpen,
  Bus,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Library,
  TrendingUp,
  Users,
} from 'lucide-react'
import { fetchDashboardKpis } from '@/lib/api/analytics'
import { getNavItemsForRole } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { isSchoolAdmin, isStaffRole } from '@/config/roles'
import type { StaffRole } from '@/types/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getErrorMessage } from '@/lib/api/client'

const KPI_CONFIG = [
  { key: 'totalStudents', label: 'Total Students', icon: GraduationCap, format: (v: number) => v.toLocaleString() },
  { key: 'totalTeachers', label: 'Staff Members', icon: Users, format: (v: number) => v.toLocaleString() },
  { key: 'totalClasses', label: 'Total Classes', icon: BookOpen, format: (v: number) => v.toLocaleString() },
  { key: 'attendanceRate', label: 'Attendance Today', icon: CalendarCheck, format: (v: number) => `${v}%` },
  { key: 'outstandingFees', label: 'Outstanding Fees (₹)', icon: CreditCard, format: (v: number) => `₹${v.toLocaleString('en-IN')}` },
  { key: 'activeRoutes', label: 'Transport Routes', icon: Bus, format: (v: number) => v.toLocaleString() },
  { key: 'totalLibraryBooks', label: 'Library Books', icon: Library, format: (v: number) => v.toLocaleString() },
  { key: 'pendingLeaves', label: 'Pending Leaves', icon: BookOpen, format: (v: number) => v.toLocaleString() },
  { key: 'overdueBooks', label: 'Overdue Books', icon: Library, format: (v: number) => v.toLocaleString() },
] as const

const SAMPLE_CHART = [
  { name: 'Mon', attendance: 92 },
  { name: 'Tue', attendance: 88 },
  { name: 'Wed', attendance: 94 },
  { name: 'Thu', attendance: 91 },
  { name: 'Fri', attendance: 87 },
  { name: 'Sat', attendance: 78 },
]

const QUICK_ACTION_LABELS: Record<string, string> = {
  '/students': 'View students',
  '/attendance': 'Record attendance',
  '/academics': 'Open academics',
  '/sports': 'Sports & activities',
  '/communication': 'Communication',
  '/finance': 'Finance & fees',
  '/library': 'Library',
  '/analytics': 'View analytics',
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = isSchoolAdmin(user?.role)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: fetchDashboardKpis,
    retry: 1,
    enabled: isAdmin,
  })

  const kpis = data?.kpis
  const quickActions = user && isStaffRole(user.role)
    ? getNavItemsForRole(user.role as StaffRole)
        .filter((item) => item.href !== '/dashboard' && item.href !== '/settings')
        .map((item) => ({
          label: QUICK_ACTION_LABELS[item.href] ?? item.title,
          href: item.href,
        }))
    : []

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </h2>
          <p className="text-muted-foreground">
            Use the sidebar or quick actions below to open your modules.
          </p>
        </div>

        {quickActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Modules available for your role</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="rounded-lg border bg-muted/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {action.label}
                </a>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">School Dashboard</h2>
          <p className="text-muted-foreground">Overview of key performance indicators</p>
        </div>
        <Badge variant="success" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Live from API
        </Badge>
      </div>

      {isError && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="pt-6 text-sm text-amber-800 dark:text-amber-200">
            Could not load dashboard data: {getErrorMessage(error)}.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {KPI_CONFIG.map((kpi) => {
          const raw = kpis?.[kpi.key]
          const value = typeof raw === 'number' ? raw : null
          if (!isLoading && value === null) return null

          return (
            <Card key={kpi.key} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{kpi.format(value!)}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Average daily attendance percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SAMPLE_CHART}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[60, 100]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-card)',
                    }}
                  />
                  <Bar dataKey="attendance" fill="oklch(0.45 0.18 264)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin workflows</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Record attendance', href: '/attendance' },
              { label: 'Collect fee payment', href: '/finance' },
              { label: 'Add new student', href: '/students' },
              { label: 'Post announcement', href: '/communication' },
              { label: 'Issue library book', href: '/library' },
              { label: 'View analytics', href: '/analytics' },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="rounded-lg border bg-muted/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                {action.label}
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

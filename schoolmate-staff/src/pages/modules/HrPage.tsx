import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, IndianRupee } from 'lucide-react'
import { toast } from 'sonner'
import {
  calculatePayroll,
  createEmployee,
  formatEmployeeEmail,
  formatEmployeeName,
  getPayrollHistory,
  listEmployees,
  markPayrollPaid,
} from '@/lib/api/hr'
import { getErrorMessage } from '@/lib/api/client'
import { buildCreateEmployeePayload, createEmployeeSchema, suggestUsername } from '@/lib/hr-form'
import { FormErrorSummary } from '@/components/shared/FormErrorSummary'
import { FormFieldError } from '@/components/shared/FormFieldError'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function HrPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'TEACHER',
    baseSalary: '',
    phone: '',
    password: '',
    department: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [payrollMonth, setPayrollMonth] = useState('')
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear().toString())

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => listEmployees({ limit: 50 }),
  })
  const { data: payroll = [], isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-history'],
    queryFn: () => getPayrollHistory(),
  })

  const updateForm = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch }
    if (patch.email !== undefined || patch.firstName !== undefined || patch.lastName !== undefined) {
      if (!form.username || form.username === suggestUsername(form.email, form.firstName, form.lastName)) {
        next.username = suggestUsername(
          patch.email ?? form.email,
          patch.firstName ?? form.firstName,
          patch.lastName ?? form.lastName,
        )
      }
    }
    setForm(next)
  }

  const createMut = useMutation({
    mutationFn: () => {
      const parsed = createEmployeeSchema.safeParse(form)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setFormErrors(errors)
        throw new Error('validation')
      }
      setFormErrors({})
      if (import.meta.env.DEV) {
        console.info('[hr] POST /hr/employees', JSON.stringify(buildCreateEmployeePayload(parsed.data)))
      }
      return createEmployee(buildCreateEmployeePayload(parsed.data))
    },
    onSuccess: () => {
      toast.success('Employee onboarded')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setOpen(false)
      setForm({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'TEACHER',
        baseSalary: '',
        phone: '',
        password: '',
        department: '',
      })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })

  const payrollMut = useMutation({
    mutationFn: () => calculatePayroll({ month: payrollMonth, year: Number(payrollYear) }),
    onSuccess: () => {
      toast.success('Payroll calculated')
      queryClient.invalidateQueries({ queryKey: ['payroll-history'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const payMut = useMutation({
    mutationFn: markPayrollPaid,
    onSuccess: () => {
      toast.success('Marked as paid')
      queryClient.invalidateQueries({ queryKey: ['payroll-history'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader
        title="HR & Staff"
        description="Employee onboarding, payroll, and payslip history."
        action={
          <Button
            onClick={() => {
              setFormErrors({})
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Onboard employee
          </Button>
        }
      />

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          {isLoading ? (
            <LoadingTable />
          ) : employeesData?.items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Salary (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {employeesData?.items.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-4 py-3">{formatEmployeeName(e)}</td>
                      <td className="px-4 py-3">{formatEmployeeEmail(e)}</td>
                      <td className="px-4 py-3"><Badge>{e.role}</Badge></td>
                      <td className="px-4 py-3">₹{e.baseSalary?.toLocaleString('en-IN') ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Month (e.g. JANUARY)"
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(e.target.value)}
              className="w-[180px]"
            />
            <Input
              placeholder="Year"
              value={payrollYear}
              onChange={(e) => setPayrollYear(e.target.value)}
              className="w-[120px]"
            />
            <Button onClick={() => payrollMut.mutate()} disabled={payrollMut.isPending}>
              <IndianRupee className="h-4 w-4" />
              Calculate payroll
            </Button>
          </div>
          {payrollLoading ? (
            <LoadingTable />
          ) : payroll.length === 0 ? (
            <EmptyState message="No payroll records." />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Period</th>
                    <th className="px-4 py-3 text-left">Net (₹)</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3">{p.employeeName ?? p.employeeId}</td>
                      <td className="px-4 py-3">{p.month} {p.year}</td>
                      <td className="px-4 py-3">₹{p.netSalary?.toLocaleString('en-IN') ?? '—'}</td>
                      <td className="px-4 py-3"><Badge>{p.status ?? 'PENDING'}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        {p.status !== 'PAID' && (
                          <Button size="sm" variant="outline" onClick={() => payMut.mutate(p.id)}>
                            Mark paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard employee</DialogTitle>
            <DialogDescription>
              Creates a staff account. Username is required for login (along with email, name, role, and salary).
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={formErrors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => updateForm({ firstName: e.target.value })}
                className={formErrors.firstName ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.firstName} />
            </div>
            <div className="space-y-2">
              <Label>Last name *</Label>
              <Input
                value={form.lastName}
                onChange={(e) => updateForm({ lastName: e.target.value })}
                className={formErrors.lastName ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.lastName} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                className={formErrors.email ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.email} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Username *</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. akhila.ganta"
                className={formErrors.username ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.username} />
              <p className="text-xs text-muted-foreground">
                Used for staff login. Auto-filled from email — you can edit it.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Login password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
                className={formErrors.password ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.password} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Transport"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className={formErrors.role ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                  <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                  <SelectItem value="DRIVER">Driver</SelectItem>
                  <SelectItem value="SPORTS">Sports coach</SelectItem>
                </SelectContent>
              </Select>
              <FormFieldError message={formErrors.role} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Base salary (₹) *</Label>
              <Input
                type="number"
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                className={formErrors.baseSalary ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.baseSalary} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              {createMut.isPending ? 'Saving...' : 'Onboard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

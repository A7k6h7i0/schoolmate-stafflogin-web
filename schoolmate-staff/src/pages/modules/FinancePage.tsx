import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, IndianRupee, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  collectCashPayment,
  createFeeStructure,
  formatFeeStructureClass,
  generateYearlyLedger,
  getDailyCashLedger,
  listFeeStructures,
  listInvoices,
} from '@/lib/api/finance'
import { listStudents } from '@/lib/api/students'
import { getErrorMessage } from '@/lib/api/client'
import { createFeeStructureSchema, currentAcademicYear } from '@/lib/finance-form'
import { useClasses } from '@/hooks/use-classes'
import { FormErrorSummary } from '@/components/shared/FormErrorSummary'
import { FormFieldError } from '@/components/shared/FormFieldError'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function FinancePage() {
  const queryClient = useQueryClient()
  const [structureOpen, setStructureOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [academicYear, setAcademicYear] = useState(currentAcademicYear())
  const [structureForm, setStructureForm] = useState({
    classId: '',
    academicYear: currentAcademicYear(),
    amount: '',
    feeInterval: 'QUARTERLY',
  })
  const [structureErrors, setStructureErrors] = useState<Record<string, string>>({})
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'CASH',
    remarks: '',
  })
  const [ledgerDate, setLedgerDate] = useState(new Date().toISOString().slice(0, 10))

  const { data: classes = [] } = useClasses()
  const classNamesById = new Map(classes.map((c) => [c.id, c.name]))
  const { data: structures = [], isLoading: structuresLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: listFeeStructures,
  })
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => listInvoices({ page: 1, limit: 50 }),
  })
  const { data: studentsData } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => listStudents({ limit: 100 }),
  })
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['daily-ledger', ledgerDate],
    queryFn: () => getDailyCashLedger({ date: ledgerDate }),
  })

  const createStructure = useMutation({
    mutationFn: () => {
      const parsed = createFeeStructureSchema.safeParse(structureForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setStructureErrors(errors)
        throw new Error('validation')
      }
      setStructureErrors({})
      return createFeeStructure(parsed.data)
    },
    onSuccess: () => {
      toast.success('Fee structure created')
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] })
      setStructureOpen(false)
      setStructureForm({
        classId: '',
        academicYear: academicYear,
        amount: '',
        feeInterval: 'QUARTERLY',
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

  const generateLedger = useMutation({
    mutationFn: () => generateYearlyLedger(academicYear),
    onSuccess: () => toast.success('Yearly ledger generation started'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const collectPayment = useMutation({
    mutationFn: () =>
      collectCashPayment(paymentForm.studentId, {
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        remarks: paymentForm.remarks,
      }),
    onSuccess: () => {
      toast.success('Payment collected')
      queryClient.invalidateQueries({ queryKey: ['invoices', 'daily-ledger'] })
      setPaymentOpen(false)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader
        title="Finance & Fees"
        description="Fee structures, cash collection, invoices, and daily ledger (INR)."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025-2026"
              className="w-[130px]"
              aria-label="Academic year"
            />
            <Button variant="outline" onClick={() => generateLedger.mutate()} disabled={generateLedger.isPending}>
              <RefreshCw className="h-4 w-4" />
              Generate yearly ledger
            </Button>
            <Button onClick={() => setPaymentOpen(true)}>
              <IndianRupee className="h-4 w-4" />
              Collect payment
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Fee structures</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="ledger">Daily cash ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="structures">
          <div className="mb-4">
            <Button
              size="sm"
              onClick={() => {
                setStructureErrors({})
                setStructureForm((prev) => ({ ...prev, academicYear: academicYear }))
                setStructureOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add structure
            </Button>
          </div>
          {structuresLoading ? (
            <LoadingTable />
          ) : structures.length === 0 ? (
            <EmptyState message="No fee structures configured." />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Academic year</th>
                    <th className="px-4 py-3 text-left">Amount (₹)</th>
                    <th className="px-4 py-3 text-left">Interval</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {formatFeeStructureClass(s, classNamesById)}
                      </td>
                      <td className="px-4 py-3">{s.academicYear ?? '—'}</td>
                      <td className="px-4 py-3">₹{s.baseFeeAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        {s.feeInterval ? (
                          <Badge variant="secondary">{s.feeInterval}</Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          {invoicesLoading ? (
            <LoadingTable />
          ) : invoicesData?.items.length === 0 ? (
            <EmptyState message="No invoices found." />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Due date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesData?.items.map((inv) => (
                    <tr key={inv.id} className="border-t">
                      <td className="px-4 py-3">{inv.studentName ?? inv.studentId}</td>
                      <td className="px-4 py-3">₹{inv.amount?.toLocaleString('en-IN') ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>
                          {inv.status ?? 'PENDING'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{inv.dueDate ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ledger">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label>Academic year (ledger)</Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025-2026"
                className="w-[140px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={ledgerDate} onChange={(e) => setLedgerDate(e.target.value)} />
            </div>
          </div>
          {ledgerLoading ? (
            <LoadingTable />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ₹{(ledger?.totalCollected ?? 0).toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{ledger?.transactionCount ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent entries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {ledger?.entries?.length ? (
                    ledger.entries.map((e, i) => (
                      <div key={i} className="flex justify-between border-b py-1">
                        <span>{e.studentName ?? 'Student'}</span>
                        <span>₹{e.amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No entries for this date.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={structureOpen} onOpenChange={setStructureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure fee structure</DialogTitle>
            <DialogDescription>
              Set the class fee for an academic year. Amount is sent as required by the fee API (class, year, and amount).
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={structureErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select
                value={structureForm.classId || undefined}
                onValueChange={(v) => setStructureForm({ ...structureForm, classId: v })}
              >
                <SelectTrigger className={structureErrors.classId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={structureErrors.classId} />
            </div>
            <div className="space-y-2">
              <Label>Academic year *</Label>
              <Input
                value={structureForm.academicYear}
                onChange={(e) => {
                  const value = e.target.value
                  setStructureForm({ ...structureForm, academicYear: value })
                  setAcademicYear(value)
                }}
                placeholder="2025-2026"
                className={structureErrors.academicYear ? 'border-destructive' : ''}
              />
              <FormFieldError message={structureErrors.academicYear} />
            </div>
            <div className="space-y-2">
              <Label>Base fee amount (₹) *</Label>
              <Input
                type="number"
                value={structureForm.amount}
                onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                className={structureErrors.amount ? 'border-destructive' : ''}
              />
              <FormFieldError message={structureErrors.amount} />
            </div>
            <div className="space-y-2">
              <Label>Interval *</Label>
              <Select value={structureForm.feeInterval} onValueChange={(v) => setStructureForm({ ...structureForm, feeInterval: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStructureOpen(false)}>Cancel</Button>
            <Button onClick={() => createStructure.mutate()} disabled={createStructure.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect cash payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={paymentForm.studentId} onValueChange={(v) => setPaymentForm({ ...paymentForm, studentId: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {studentsData?.items.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input value={paymentForm.remarks} onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={() => collectPayment.mutate()} disabled={collectPayment.isPending}>Collect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

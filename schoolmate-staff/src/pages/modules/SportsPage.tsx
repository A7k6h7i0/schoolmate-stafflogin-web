import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { assignStudent, createSport, deleteSport, listSports } from '@/lib/api/sports'
import { formatEmployeeName, listEmployees } from '@/lib/api/hr'
import { getErrorMessage } from '@/lib/api/client'
import { FormErrorSummary } from '@/components/shared/FormErrorSummary'
import { FormFieldError } from '@/components/shared/FormFieldError'
import { useIsSchoolAdmin } from '@/hooks/use-is-school-admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { buildCreateSportPayload, createSportSchema } from '@/lib/sports-form'

export function SportsPage() {
  const isAdmin = useIsSchoolAdmin()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedSportId, setSelectedSportId] = useState('')
  const [form, setForm] = useState({ name: '', description: '', instructorId: '', maxParticipants: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [studentId, setStudentId] = useState('')

  const { data: sports = [], isLoading } = useQuery({ queryKey: ['sports'], queryFn: listSports })

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => listEmployees({ limit: 100 }),
  })
  const instructors = employeesData?.items ?? []

  const createMut = useMutation({
    mutationFn: () => {
      const parsed = createSportSchema.safeParse(form)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setFormErrors(errors)
        throw new Error('validation')
      }
      setFormErrors({})
      return createSport(buildCreateSportPayload(parsed.data))
    },
    onSuccess: () => {
      toast.success('Sport created')
      queryClient.invalidateQueries({ queryKey: ['sports'] })
      setOpen(false)
      setForm({ name: '', description: '', instructorId: '', maxParticipants: '' })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteSport,
    onSuccess: () => {
      toast.success('Sport removed')
      queryClient.invalidateQueries({ queryKey: ['sports'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const assignMut = useMutation({
    mutationFn: () => assignStudent(selectedSportId, studentId),
    onSuccess: () => {
      toast.success('Student assigned')
      setAssignOpen(false)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader
        title="Sports & Activities"
        description="Manage sports catalog and student assignments."
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setFormErrors({})
                setOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add sport
            </Button>
          ) : undefined
        }
      />
      {isLoading ? (
        <LoadingTable />
      ) : sports.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sports.map((s) => (
            <div key={s.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this sport?')) deleteMut.mutate(s.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              {s.coachName && (
                <p className="mt-1 text-xs text-muted-foreground">Coach: {s.coachName}</p>
              )}
              {isAdmin && (
                <Button
                  size="sm"
                  className="mt-3"
                  variant="outline"
                  onClick={() => {
                    setSelectedSportId(s.id)
                    setAssignOpen(true)
                  }}
                >
                  Assign student
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add sport</DialogTitle>
            <DialogDescription>
              Sport name and coach (staff ID) are sent to POST /api/v1/sports as activityName and
              instructorId.
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={formErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sport name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Volleyball, Cricket"
                className={formErrors.name ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.name} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Coach (staff) *</Label>
              <Select
                value={form.instructorId || undefined}
                onValueChange={(v) => setForm({ ...form, instructorId: v })}
              >
                <SelectTrigger className={formErrors.instructorId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.length === 0 ? (
                    <SelectItem value="no-staff" disabled>
                      No staff — add employees in HR &amp; Staff first
                    </SelectItem>
                  ) : (
                    instructors
                      .filter((e) => e.id)
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {formatEmployeeName(e)} ({e.role})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormFieldError message={formErrors.instructorId} />
              <p className="text-xs text-muted-foreground">
                Coach must be a staff record from HR — not a free-text name.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Max participants</Label>
              <Input
                type="number"
                value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                placeholder="e.g. 11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              {createMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign student to sport</DialogTitle>
            <DialogDescription>Enter the student MongoDB ID from the Students module.</DialogDescription>
          </DialogHeader>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student ID" />
          <DialogFooter>
            <Button onClick={() => assignMut.mutate()}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

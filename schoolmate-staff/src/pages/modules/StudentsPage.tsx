import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, IdCard, Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  createStudent,
  deleteStudent,
  getStudentIdCard,
  listStudents,
  updateStudent,
} from '@/lib/api/students'
import { getErrorMessage } from '@/lib/api/client'
import { extractFieldErrors } from '@/lib/api-errors'
import { useClasses, useSectionsForClass } from '@/hooks/use-classes'
import { resolveClassSectionIds } from '@/lib/api/classes'
import { getApiErrorDetails } from '@/lib/api/error-details'
import { FormErrorSummary } from '@/components/shared/FormErrorSummary'
import { FormFieldError } from '@/components/shared/FormFieldError'
import { useIsSchoolAdmin } from '@/hooks/use-is-school-admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { buildCreateStudentPayload, createStudentSchema } from '@/lib/students-form'
import type { Student } from '@/types/entities'

export function StudentsPage() {
  const isAdmin = useIsSchoolAdmin()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [classFilter, setClassFilter] = useState('')
  const [sectionFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    emergencyContact: '',
    classId: '',
    sectionId: '',
    fatherName: '',
    motherName: '',
    primaryPhone: '',
    homeAddress: '',
    bloodGroup: '',
    medicalNotes: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: classes = [] } = useClasses()
  const sections = useSectionsForClass(form.classId || undefined, classes)
  const selectedClass = classes.find((c) => c.id === form.classId)
  const selectedSection = sections.find((s) => s.id === form.sectionId)

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, classFilter, sectionFilter],
    queryFn: () =>
      listStudents({
        page,
        limit: 20,
        classId: classFilter || undefined,
        sectionId: sectionFilter || undefined,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateStudent(editing.id, {
          emergencyContact: form.emergencyContact.trim(),
          bloodGroup: form.bloodGroup || undefined,
          medicalDetails: form.medicalNotes.trim() || undefined,
        })
      }

      const parsed = createStudentSchema.safeParse(form)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          const key = String(issue.path[0] ?? 'form')
          errors[key] = issue.message
        })
        setFormErrors(errors)
        throw new Error('validation')
      }

      if (!selectedClass) {
        setFormErrors({ classId: 'Select a class from the dropdown (create one in Academics first).' })
        throw new Error('validation')
      }
      if (!selectedSection) {
        setFormErrors({
          sectionId: 'Select a section for this class (add one in Academics → Add section).',
        })
        throw new Error('validation')
      }

      const resolved = await resolveClassSectionIds(
        parsed.data.classId,
        parsed.data.sectionId,
        selectedSection?.name,
      )
      if (!resolved) {
        setFormErrors({
          classId: 'Class not found on server. Create it again in Academics.',
          sectionId: 'Section not found on server. Add section again under that class in Academics.',
        })
        throw new Error('validation')
      }

      setFormErrors({})
      const payload = buildCreateStudentPayload({
        ...parsed.data,
        classId: resolved.classId,
        sectionId: resolved.sectionId,
      })
      if (import.meta.env.DEV) {
        console.info('[students] POST /students payload', payload)
      }
      return createStudent(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Student updated' : 'Student registered')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setDialogOpen(false)
      setEditing(null)
      setFormErrors({})
    },
    onError: (e) => {
      const apiDetails = getApiErrorDetails(e)
      if (import.meta.env.DEV && apiDetails) {
        console.error('[students] API error', apiDetails.status, apiDetails.url, apiDetails.body)
      }

      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted required fields')
        return
      }

      const apiErrors = extractFieldErrors(e)
      if (apiErrors) {
        setFormErrors(apiErrors)
        toast.error('Please fix the highlighted required fields')
        return
      }

      const msg = getErrorMessage(e)
      if (msg.toLowerCase().includes('missing') || msg.toLowerCase().includes('required')) {
        const parsed = createStudentSchema.safeParse(form)
        if (!parsed.success) {
          const errors: Record<string, string> = {}
          parsed.error.issues.forEach((issue) => {
            errors[String(issue.path[0] ?? 'form')] = issue.message
          })
          setFormErrors(errors)
          toast.error('Please fix the highlighted required fields')
          return
        }

        if (!selectedClass || !selectedSection) {
          setFormErrors({
            ...(selectedClass ? {} : { classId: 'Class not found — create it in Academics, then select here.' }),
            ...(selectedSection
              ? {}
              : { sectionId: 'Section not found — add it under that class in Academics.' }),
          })
          toast.error('Class or section not loaded. Set them up in Academics first.')
          return
        }

        setFormErrors({
          classId:
            'Class/section not accepted by server. Go to Academics, delete and re-create class + section, then select again.',
          sectionId:
            'Class/section not accepted by server. Go to Academics, delete and re-create class + section, then select again.',
        })
      }

      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      toast.success('Student removed')
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      emergencyContact: '',
      classId: '',
      sectionId: '',
      fatherName: '',
      motherName: '',
      primaryPhone: '',
      homeAddress: '',
      bloodGroup: '',
      medicalNotes: '',
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  const openEdit = (student: Student) => {
    setEditing(student)
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender ?? 'MALE',
      dateOfBirth: student.dateOfBirth ?? '',
      emergencyContact: student.emergencyContact ?? '',
      classId: student.classId ?? '',
      sectionId: student.sectionId ?? '',
      fatherName: student.parentContact?.fatherName ?? '',
      motherName: student.parentContact?.motherName ?? '',
      primaryPhone: student.parentContact?.primaryPhone ?? '',
      homeAddress: student.parentContact?.homeAddress ?? '',
      bloodGroup: student.bloodGroup ?? '',
      medicalNotes: student.medicalNotes ?? '',
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleIdCard = async (id: string) => {
    try {
      const card = await getStudentIdCard(id)
      toast.success('ID card data loaded')
      console.info('Student ID card:', card)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student roster, profiles, and parent contacts."
        action={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add student
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={classFilter || 'all'} onValueChange={(v) => setClassFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setPage(1)}>
          <Search className="h-4 w-4" />
          Apply filters
        </Button>
      </div>

      {isLoading ? (
        <LoadingTable />
      ) : data?.items.length === 0 ? (
        <EmptyState message="No students found. Register your first student." />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Enrollment</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Class</th>
                <th className="px-4 py-3 text-left font-medium">Gender</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{student.enrollmentNumber ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {student.className ?? student.classId ?? '—'}
                    {student.sectionName ? ` · ${student.sectionName}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{student.gender ?? '—'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleIdCard(student.id)}>
                        <IdCard className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Remove this student?')) deleteMutation.mutate(student.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit student' : 'Register student'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update emergency contact and medical details.'
                : 'All fields marked with * are sent to POST /api/v1/students on the Schoolmate server.'}
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={formErrors} />
          {!editing && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Class &amp; section setup</p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Go to <strong>Academics</strong> → <strong>Add class</strong> (e.g. Grade 10, Class 10)</li>
                <li>Click <strong>Add section</strong> and pick that class (e.g. Section A, Section B)</li>
                <li>Return here and select the same class and section from the dropdowns</li>
              </ol>
              {classes.length === 0 && (
                <p className="mt-2 text-destructive">No classes loaded — create a class in Academics first.</p>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={formErrors.firstName ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.firstName} />
            </div>
            <div className="space-y-2">
              <Label>Last name *</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={formErrors.lastName ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.lastName} />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className={formErrors.gender ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormFieldError message={formErrors.gender} />
            </div>
            <div className="space-y-2">
              <Label>Date of birth *</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className={formErrors.dateOfBirth ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.dateOfBirth} />
            </div>
            <div className="space-y-2">
              <Label>Emergency contact *</Label>
              <Input
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                className={formErrors.emergencyContact ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.emergencyContact} />
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select
                value={form.classId || undefined}
                onValueChange={(v) => setForm({ ...form, classId: v, sectionId: '' })}
                disabled={!!editing}
              >
                <SelectTrigger className={formErrors.classId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>
                      No classes — add in Academics first
                    </SelectItem>
                  ) : (
                    classes
                      .filter((c) => c.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormFieldError message={formErrors.classId} />
              {selectedClass && (
                <p className="text-xs text-muted-foreground">Selected: {selectedClass.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Section *</Label>
              <Select
                value={form.sectionId || undefined}
                onValueChange={(v) => setForm({ ...form, sectionId: v })}
                disabled={!form.classId || !!editing}
              >
                <SelectTrigger className={formErrors.sectionId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={form.classId ? 'Select section' : 'Select class first'} />
                </SelectTrigger>
                <SelectContent>
                  {!form.classId ? (
                    <SelectItem value="no-class" disabled>Select a class first</SelectItem>
                  ) : sections.length === 0 ? (
                    <SelectItem value="no-sections" disabled>
                      No sections — add in Academics first
                    </SelectItem>
                  ) : (
                    sections
                      .filter((s) => s.id)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormFieldError message={formErrors.sectionId} />
              {selectedSection && (
                <p className="text-xs text-muted-foreground">Selected: {selectedSection.name}</p>
              )}
              {form.classId && sections.length === 0 && (
                <p className="text-xs text-amber-600">
                  No sections for this class. Add one in Academics → Add section.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Father name *</Label>
              <Input
                value={form.fatherName}
                onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                className={formErrors.fatherName ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.fatherName} />
            </div>
            <div className="space-y-2">
              <Label>Mother name *</Label>
              <Input
                value={form.motherName}
                onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                className={formErrors.motherName ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.motherName} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Parent phone *</Label>
              <Input
                value={form.primaryPhone}
                onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
                className={formErrors.primaryPhone ? 'border-destructive' : ''}
              />
              <FormFieldError message={formErrors.primaryPhone} />
            </div>
            {!editing && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Home address *</Label>
                <Textarea
                  value={form.homeAddress}
                  onChange={(e) => setForm({ ...form, homeAddress: e.target.value })}
                  placeholder="Street, city, postal code"
                  rows={2}
                  className={formErrors.homeAddress ? 'border-destructive' : ''}
                />
                <FormFieldError message={formErrors.homeAddress} />
              </div>
            )}
            {editing && (
              <>
                <div className="space-y-2">
                  <Label>Blood group</Label>
                  <Input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Medical notes</Label>
                  <Input value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

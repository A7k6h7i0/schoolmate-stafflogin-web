import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  createClass,
  createExam,
  createHomework,
  createSection,
  createSubject,
  listExams,
  listHomework,
  listSubjects,
} from '@/lib/api/classes'
import { getErrorMessage } from '@/lib/api/client'
import { mergeSectionIntoClasses, upsertClass } from '@/lib/api/normalize'
import { CLASSES_QUERY_KEY, useClasses } from '@/hooks/use-classes'
import type { ClassLevel } from '@/types/entities'
import { useIsSchoolAdmin } from '@/hooks/use-is-school-admin'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AcademicsPage() {
  const isAdmin = useIsSchoolAdmin()
  const queryClient = useQueryClient()
  const [classDialog, setClassDialog] = useState(false)
  const [sectionDialog, setSectionDialog] = useState(false)
  const [subjectDialog, setSubjectDialog] = useState(false)
  const [homeworkDialog, setHomeworkDialog] = useState(false)
  const [examDialog, setExamDialog] = useState(false)
  const [className, setClassName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [sectionClassId, setSectionClassId] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' })
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    description: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    dueDate: '',
  })
  const [examForm, setExamForm] = useState({ name: '', examType: 'TERM', academicYear: '2025-2026' })

  const { data: classes = [], isLoading: classesLoading, isError: classesError, error: classesErrorObj } = useClasses()
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: listSubjects,
  })
  const { data: homework = [], isLoading: homeworkLoading } = useQuery({
    queryKey: ['homework'],
    queryFn: () => listHomework(),
  })
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: listExams,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['subjects'] })
    queryClient.invalidateQueries({ queryKey: ['homework'] })
    queryClient.invalidateQueries({ queryKey: ['exams'] })
  }

  const addClass = useMutation({
    mutationFn: () => createClass({ name: className.trim(), gradeLevel: Number(gradeLevel) || undefined }),
    onSuccess: async (newClass) => {
      queryClient.setQueryData<ClassLevel[]>(CLASSES_QUERY_KEY, (old) =>
        upsertClass(old ?? [], newClass),
      )
      toast.success(`Class "${newClass.name}" created`)
      setClassDialog(false)
      setClassName('')
      setGradeLevel('')
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const addSection = useMutation({
    mutationFn: () => createSection(sectionClassId, { name: sectionName.trim() }),
    onSuccess: async (section) => {
      queryClient.setQueryData<ClassLevel[]>(CLASSES_QUERY_KEY, (old) =>
        mergeSectionIntoClasses(old ?? [], sectionClassId, section),
      )
      toast.success(`Section "${section.name}" created`)
      setSectionDialog(false)
      setSectionName('')
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const addSubject = useMutation({
    mutationFn: () => createSubject(subjectForm),
    onSuccess: () => { toast.success('Subject created'); invalidate(); setSubjectDialog(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const addHomework = useMutation({
    mutationFn: () => createHomework(homeworkForm),
    onSuccess: () => { toast.success('Homework published'); invalidate(); setHomeworkDialog(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const addExam = useMutation({
    mutationFn: () => createExam(examForm),
    onSuccess: () => { toast.success('Exam created'); invalidate(); setExamDialog(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const homeworkSections = classes.find((c) => c.id === homeworkForm.classId)?.sections ?? []

  return (
    <div>
      <PageHeader title="Academics" description="Classes, subjects, homework, exams, and report cards." />

      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          {isAdmin && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setClassDialog(true)}><Plus className="h-4 w-4" />Add class</Button>
              <Button size="sm" variant="outline" onClick={() => setSectionDialog(true)}><Plus className="h-4 w-4" />Add section</Button>
            </div>
          )}
          {classesError && (
            <p className="mb-4 text-sm text-destructive">
              Failed to load classes: {getErrorMessage(classesErrorObj)}
            </p>
          )}
          {classesLoading ? <LoadingTable /> : classes.length === 0 ? (
            <EmptyState message="No classes yet. Click Add class to create one." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {classes.map((c) => (
                <div key={c.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">Grade {c.gradeLevel ?? '—'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.sections?.map((s) => (
                      <span key={s.id} className="rounded-md bg-muted px-2 py-1 text-xs">{s.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects">
          {isAdmin && (
            <Button size="sm" className="mb-4" onClick={() => setSubjectDialog(true)}><Plus className="h-4 w-4" />Add subject</Button>
          )}
          {subjectsLoading ? <LoadingTable /> : subjects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Code</th></tr></thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">{s.code ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="homework">
          {isAdmin && (
            <Button size="sm" className="mb-4" onClick={() => setHomeworkDialog(true)}><Plus className="h-4 w-4" />Publish homework</Button>
          )}
          {homeworkLoading ? <LoadingTable /> : homework.length === 0 ? <EmptyState /> : (
            <div className="space-y-3">
              {homework.map((h) => (
                <div key={h.id} className="rounded-xl border p-4">
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-muted-foreground">{h.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Due: {h.dueDate ?? '—'}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exams">
          {isAdmin && (
            <Button size="sm" className="mb-4" onClick={() => setExamDialog(true)}><Plus className="h-4 w-4" />Create exam</Button>
          )}
          {examsLoading ? <LoadingTable /> : exams.length === 0 ? <EmptyState /> : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Year</th></tr></thead>
                <tbody>
                  {exams.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-4 py-3">{e.name}</td>
                      <td className="px-4 py-3">{e.examType}</td>
                      <td className="px-4 py-3">{e.academicYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={classDialog} onOpenChange={setClassDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add class</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={className} onChange={(e) => setClassName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Grade level</Label><Input type="number" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => addClass.mutate()} disabled={!className.trim() || addClass.isPending}>
              {addClass.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add section</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={sectionClassId || undefined} onValueChange={setSectionClassId}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={sectionName} onChange={(e) => setSectionName(e.target.value)} placeholder="Section name" />
          </div>
          <DialogFooter>
            <Button
              onClick={() => addSection.mutate()}
              disabled={!sectionClassId || !sectionName.trim() || addSection.isPending}
            >
              {addSection.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subjectDialog} onOpenChange={setSubjectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add subject</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="Name" />
            <Input value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="Code" />
          </div>
          <DialogFooter><Button onClick={() => addSubject.mutate()}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={homeworkDialog} onOpenChange={setHomeworkDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish homework</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={homeworkForm.title} onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })} placeholder="Title" />
            <Textarea value={homeworkForm.description} onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })} placeholder="Description" />
            <Select value={homeworkForm.classId} onValueChange={(v) => setHomeworkForm({ ...homeworkForm, classId: v, sectionId: '' })}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={homeworkForm.sectionId} onValueChange={(v) => setHomeworkForm({ ...homeworkForm, sectionId: v })}>
              <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>{homeworkSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={homeworkForm.subjectId} onValueChange={(v) => setHomeworkForm({ ...homeworkForm, subjectId: v })}>
              <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="datetime-local" value={homeworkForm.dueDate} onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })} />
          </div>
          <DialogFooter><Button onClick={() => addHomework.mutate()}>Publish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={examDialog} onOpenChange={setExamDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create exam</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} placeholder="Exam name" />
            <Input value={examForm.academicYear} onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })} placeholder="Academic year" />
          </div>
          <DialogFooter><Button onClick={() => addExam.mutate()}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

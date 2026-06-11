import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  createAnnouncement,
  listAnnouncements,
  listMeetings,
  scheduleMeeting,
} from '@/lib/api/communication'
import { getErrorMessage } from '@/lib/api/client'
import { createAnnouncementSchema } from '@/lib/communication-form'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { FormErrorSummary } from '@/components/shared/FormErrorSummary'
import { FormFieldError } from '@/components/shared/FormFieldError'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CommunicationPage() {
  const queryClient = useQueryClient()
  const [annOpen, setAnnOpen] = useState(false)
  const [meetOpen, setMeetOpen] = useState(false)
  const [annForm, setAnnForm] = useState({ title: '', content: '', audienceScope: 'ALL' })
  const [annErrors, setAnnErrors] = useState<Record<string, string>>({})
  const [meetForm, setMeetForm] = useState({
    teacherId: '',
    parentId: '',
    studentId: '',
    scheduledAt: '',
    notes: '',
  })

  const { data: announcements = [], isLoading: annLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: listAnnouncements,
  })
  const { data: meetings = [], isLoading: meetLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: listMeetings,
  })

  const createAnn = useMutation({
    mutationFn: () => {
      const parsed = createAnnouncementSchema.safeParse(annForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setAnnErrors(errors)
        throw new Error('validation')
      }
      setAnnErrors({})
      return createAnnouncement(parsed.data)
    },
    onSuccess: () => {
      toast.success('Announcement posted')
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setAnnOpen(false)
      setAnnForm({ title: '', content: '', audienceScope: 'ALL' })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })

  const createMeet = useMutation({
    mutationFn: () => scheduleMeeting(meetForm),
    onSuccess: () => {
      toast.success('Meeting scheduled')
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      setMeetOpen(false)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader title="Communication" description="Announcements, messaging, and parent-teacher meetings." />
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="meetings">PTM schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <Button
            size="sm"
            className="mb-4"
            onClick={() => {
              setAnnErrors({})
              setAnnOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Post announcement
          </Button>
          {annLoading ? (
            <LoadingTable />
          ) : announcements.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.body ?? a.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{a.audience ?? ''}</p>
                  <p className="text-xs text-muted-foreground">{a.createdAt ?? ''}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meetings">
          <Button size="sm" className="mb-4" onClick={() => setMeetOpen(true)}>
            <Plus className="h-4 w-4" />
            Schedule meeting
          </Button>
          {meetLoading ? (
            <LoadingTable />
          ) : meetings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Scheduled</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-3">{m.scheduledAt ?? '—'}</td>
                      <td className="px-4 py-3">{m.status ?? 'SCHEDULED'}</td>
                      <td className="px-4 py-3">{m.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={annOpen} onOpenChange={setAnnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post announcement</DialogTitle>
            <DialogDescription>
              Broadcast a notice to parents, teachers, or students. Message is sent as content to the announcements API.
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={annErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={annForm.title}
                onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                placeholder="Title"
                className={annErrors.title ? 'border-destructive' : ''}
              />
              <FormFieldError message={annErrors.title} />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={annForm.content}
                onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                placeholder="Message"
                className={annErrors.content ? 'border-destructive' : ''}
              />
              <FormFieldError message={annErrors.content} />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={annForm.audienceScope}
                onValueChange={(v) => setAnnForm({ ...annForm, audienceScope: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Everyone</SelectItem>
                  <SelectItem value="PARENTS">Parents</SelectItem>
                  <SelectItem value="TEACHERS">Teachers</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => createAnn.mutate()} disabled={createAnn.isPending}>
              {createAnn.isPending ? 'Posting...' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={meetOpen} onOpenChange={setMeetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule PTM</DialogTitle>
            <DialogDescription>Book a parent-teacher meeting with teacher, parent, and student IDs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={meetForm.teacherId}
              onChange={(e) => setMeetForm({ ...meetForm, teacherId: e.target.value })}
              placeholder="Teacher ID"
            />
            <Input
              value={meetForm.parentId}
              onChange={(e) => setMeetForm({ ...meetForm, parentId: e.target.value })}
              placeholder="Parent ID"
            />
            <Input
              value={meetForm.studentId}
              onChange={(e) => setMeetForm({ ...meetForm, studentId: e.target.value })}
              placeholder="Student ID"
            />
            <Input
              type="datetime-local"
              value={meetForm.scheduledAt}
              onChange={(e) => setMeetForm({ ...meetForm, scheduledAt: e.target.value })}
            />
            <Textarea
              value={meetForm.notes}
              onChange={(e) => setMeetForm({ ...meetForm, notes: e.target.value })}
              placeholder="Notes"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => createMeet.mutate()}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

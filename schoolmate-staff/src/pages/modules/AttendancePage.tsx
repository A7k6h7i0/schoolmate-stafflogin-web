import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAttendanceReports,
  listLeaves,
  recordAttendance,
  submitLeave,
  updateLeaveStatus,
} from '@/lib/api/attendance'
import { listStudents } from '@/lib/api/students'
import { useClasses } from '@/hooks/use-classes'
import { getErrorMessage } from '@/lib/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AttendancePage() {
  const queryClient = useQueryClient()
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const [leaveForm, setLeaveForm] = useState({
    studentId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const { data: classes = [] } = useClasses()
  const sections = classes.find((c) => c.id === classId)?.sections ?? []

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-attendance', classId, sectionId],
    queryFn: () =>
      listStudents({
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        limit: 100,
      }),
    enabled: Boolean(classId),
  })

  const { data: leaves = [], isLoading: leavesLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: listLeaves,
  })

  const { data: reports } = useQuery({
    queryKey: ['attendance-reports'],
    queryFn: () => getAttendanceReports(),
  })

  const recordMutation = useMutation({
    mutationFn: () => {
      const records = (studentsData?.items ?? []).map((s) => ({
        studentId: s.id,
        status: statusMap[s.id] ?? 'PRESENT',
      }))
      return recordAttendance({ classId, sectionId, date, records })
    },
    onSuccess: () => toast.success('Attendance recorded'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const leaveMutation = useMutation({
    mutationFn: () => submitLeave(leaveForm),
    onSuccess: () => {
      toast.success('Leave request submitted')
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const approveLeave = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      updateLeaveStatus(id, status),
    onSuccess: () => {
      toast.success('Leave updated')
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader title="Attendance" description="Record daily attendance, manage leaves, and view reports." />

      <Tabs defaultValue="record">
        <TabsList>
          <TabsTrigger value="record">Record attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leave requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId('') }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[160px]" />
            <Button onClick={() => recordMutation.mutate()} disabled={!classId || recordMutation.isPending}>
              Save attendance
            </Button>
          </div>

          {!classId ? (
            <EmptyState message="Select a class to record attendance." />
          ) : studentsLoading ? (
            <LoadingTable />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData?.items.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={statusMap[s.id] ?? 'PRESENT'}
                          onValueChange={(v) => setStatusMap({ ...statusMap, [s.id]: v })}
                        >
                          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">Present</SelectItem>
                            <SelectItem value="ABSENT">Absent</SelectItem>
                            <SelectItem value="LATE">Late</SelectItem>
                            <SelectItem value="HALF_DAY">Half day</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Submit leave request</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input value={leaveForm.studentId} onChange={(e) => setLeaveForm({ ...leaveForm, studentId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Reason</Label>
                <Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
              </div>
              <Button onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}>Submit leave</Button>
            </CardContent>
          </Card>

          {leavesLoading ? (
            <LoadingTable />
          ) : leaves.length === 0 ? (
            <EmptyState message="No leave requests." />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Dates</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-4 py-3">{l.studentName ?? l.studentId}</td>
                      <td className="px-4 py-3">{l.startDate} → {l.endDate}</td>
                      <td className="px-4 py-3"><Badge>{l.status ?? 'PENDING'}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        {l.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => approveLeave.mutate({ id: l.id, status: 'APPROVED' })}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => approveLeave.mutate({ id: l.id, status: 'REJECTED' })}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader><CardTitle className="text-base">Attendance summary</CardTitle></CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
                {JSON.stringify(reports ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

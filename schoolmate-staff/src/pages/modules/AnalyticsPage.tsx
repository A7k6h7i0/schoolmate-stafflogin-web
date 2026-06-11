import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { fetchStudentPerformance, fetchTeacherPerformance } from '@/lib/api/analytics'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AnalyticsPage() {
  const [studentId, setStudentId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [activeStudentId, setActiveStudentId] = useState('')
  const [activeTeacherId, setActiveTeacherId] = useState('')

  const { data: studentPerf, isLoading: studentLoading } = useQuery({
    queryKey: ['student-performance', activeStudentId],
    queryFn: () => fetchStudentPerformance(activeStudentId),
    enabled: Boolean(activeStudentId),
  })

  const { data: teacherPerf, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher-performance', activeTeacherId],
    queryFn: () => fetchTeacherPerformance(activeTeacherId),
    enabled: Boolean(activeTeacherId),
  })

  return (
    <div>
      <PageHeader title="Analytics & Reporting" description="Student and teacher performance analytics." />

      <Tabs defaultValue="student">
        <TabsList>
          <TabsTrigger value="student">Student performance</TabsTrigger>
          <TabsTrigger value="teacher">Teacher performance</TabsTrigger>
        </TabsList>

        <TabsContent value="student" className="space-y-4">
          <div className="flex gap-3">
            <div className="space-y-2 flex-1 max-w-md">
              <Label>Student ID</Label>
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="MongoDB ObjectId" />
            </div>
            <Button className="mt-8" onClick={() => setActiveStudentId(studentId)}>
              <Search className="h-4 w-4" />Load report
            </Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Student performance data</CardTitle></CardHeader>
            <CardContent>
              {studentLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : activeStudentId ? (
                <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
                  {JSON.stringify(studentPerf ?? {}, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">Enter a student ID to view analytics.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher" className="space-y-4">
          <div className="flex gap-3">
            <div className="space-y-2 flex-1 max-w-md">
              <Label>Teacher ID</Label>
              <Input value={teacherId} onChange={(e) => setTeacherId(e.target.value)} placeholder="MongoDB ObjectId" />
            </div>
            <Button className="mt-8" onClick={() => setActiveTeacherId(teacherId)}>
              <Search className="h-4 w-4" />Load report
            </Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Teacher performance data</CardTitle></CardHeader>
            <CardContent>
              {teacherLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : activeTeacherId ? (
                <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
                  {JSON.stringify(teacherPerf ?? {}, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">Enter a teacher ID to view analytics.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

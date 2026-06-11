import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Download, Upload, Database, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { exportFinances, exportStudents, importStudents, triggerBackup } from '@/lib/api/data'
import { downloadBlob } from '@/lib/download'
import { getErrorMessage } from '@/lib/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DataOpsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const backupMut = useMutation({
    mutationFn: triggerBackup,
    onSuccess: (data) => {
      toast.success('Backup triggered')
      console.info('Backup response:', data)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const result = await importStudents(file)
      toast.success('Import completed')
      console.info('Import result:', result)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setImporting(false)
    }
  }

  const handleExportStudents = async () => {
    try {
      const blob = await exportStudents()
      downloadBlob(blob, 'students-export.xlsx')
      toast.success('Students exported')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleExportFinances = async () => {
    try {
      const blob = await exportFinances()
      downloadBlob(blob, 'finances-export.xlsx')
      toast.success('Finances exported')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader title="Data Operations" description="Bulk import/export and database backup." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />Import students
            </CardTitle>
            <CardDescription>Upload CSV or Excel roster file</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
              }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? 'Importing...' : 'Choose file'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-4 w-4" />Export students
            </CardTitle>
            <CardDescription>Download student roster as Excel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExportStudents}>
              <Download className="h-4 w-4" />Export Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-4 w-4" />Export finances
            </CardTitle>
            <CardDescription>Download financial data as Excel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExportFinances}>
              <Download className="h-4 w-4" />Export Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />Database backup
            </CardTitle>
            <CardDescription>Trigger full tenant database backup</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => backupMut.mutate()}
              disabled={backupMut.isPending}
            >
              {backupMut.isPending ? 'Triggering...' : 'Run backup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

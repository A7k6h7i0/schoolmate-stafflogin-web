import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
  createBook,
  issueBook,
  listBooks,
  listIssues,
  listOverdue,
  payFine,
  returnBook,
} from '@/lib/api/library'
import { getErrorMessage } from '@/lib/api/client'
import { createBookSchema, suggestBarcode } from '@/lib/library-form'
import { useIsSchoolAdmin } from '@/hooks/use-is-school-admin'
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
import { Badge } from '@/components/ui/badge'

export function LibraryPage() {
  const isAdmin = useIsSchoolAdmin()
  const queryClient = useQueryClient()
  const [bookOpen, setBookOpen] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    barcode: '',
    category: '',
    rackLocation: '',
    totalCopies: '',
  })
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({})
  const [issueForm, setIssueForm] = useState({ bookId: '', studentId: '' })
  const [returnForm, setReturnForm] = useState({ issueId: '', bookId: '', studentId: '' })

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => listBooks(),
  })
  const { data: issues = [], isLoading: issuesLoading } = useQuery({ queryKey: ['issues'], queryFn: listIssues })
  const { data: overdue = [] } = useQuery({ queryKey: ['overdue'], queryFn: listOverdue })

  const updateBookForm = (patch: Partial<typeof bookForm>) => {
    const next = { ...bookForm, ...patch }
    if (
      (patch.isbn !== undefined || patch.title !== undefined) &&
      (!bookForm.barcode || bookForm.barcode === suggestBarcode(bookForm.isbn, bookForm.title))
    ) {
      next.barcode = suggestBarcode(patch.isbn ?? bookForm.isbn, patch.title ?? bookForm.title)
    }
    setBookForm(next)
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['books'] })
    queryClient.invalidateQueries({ queryKey: ['issues'] })
    queryClient.invalidateQueries({ queryKey: ['overdue'] })
  }

  const bookMut = useMutation({
    mutationFn: () => {
      const parsed = createBookSchema.safeParse(bookForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setBookErrors(errors)
        throw new Error('validation')
      }
      setBookErrors({})
      return createBook(parsed.data)
    },
    onSuccess: () => {
      toast.success('Book added')
      invalidate()
      setBookOpen(false)
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        barcode: '',
        category: '',
        rackLocation: '',
        totalCopies: '',
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
  const issueMut = useMutation({
    mutationFn: () => issueBook(issueForm),
    onSuccess: () => { toast.success('Book issued'); invalidate(); setIssueOpen(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const returnMut = useMutation({
    mutationFn: () => returnBook(returnForm),
    onSuccess: () => { toast.success('Book returned'); invalidate(); setReturnOpen(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const fineMut = useMutation({
    mutationFn: payFine,
    onSuccess: () => { toast.success('Fine settled'); invalidate() },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader title="Library" description="Book catalog, issue/return, overdue tracking, and fines." />
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="issues">Issued books</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          {isAdmin && (
            <Button
              size="sm"
              className="mb-4"
              onClick={() => {
                setBookErrors({})
                setBookOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add book
            </Button>
          )}
          {booksLoading ? <LoadingTable /> : books.length === 0 ? <EmptyState /> : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Author</th><th className="px-4 py-3 text-left">Available</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{b.title}</td>
                      <td className="px-4 py-3">{b.author ?? '—'}</td>
                      <td className="px-4 py-3">{b.availableCopies ?? b.totalCopies ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {isAdmin && (
                          <Button size="sm" variant="outline" onClick={() => { setIssueForm({ bookId: b.id, studentId: '' }); setIssueOpen(true) }}>
                            <BookOpen className="h-3 w-3" />Issue
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

        <TabsContent value="issues">
          {isAdmin && (
            <Button size="sm" className="mb-4" variant="outline" onClick={() => setReturnOpen(true)}><RotateCcw className="h-4 w-4" />Return book</Button>
          )}
          {issuesLoading ? <LoadingTable /> : issues.length === 0 ? <EmptyState /> : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Book</th><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Due</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="px-4 py-3">{i.bookTitle ?? i.bookId}</td>
                      <td className="px-4 py-3">{i.studentName ?? i.studentId}</td>
                      <td className="px-4 py-3">{i.dueDate ?? '—'}</td>
                      <td className="px-4 py-3"><Badge>{i.status ?? 'ACTIVE'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue">
          {overdue.length === 0 ? <EmptyState message="No overdue books." /> : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Book</th><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-right">Fine</th></tr></thead>
                <tbody>
                  {overdue.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="px-4 py-3">{i.bookTitle ?? i.bookId}</td>
                      <td className="px-4 py-3">{i.studentName ?? i.studentId}</td>
                      <td className="px-4 py-3 text-right">
                        {isAdmin && (
                          <Button size="sm" onClick={() => fineMut.mutate(i.id)}>Pay fine</Button>
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

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add book</DialogTitle>
            <DialogDescription>
              Title, ISBN, and barcode are required. Barcode is auto-filled — edit if your copy has a different label.
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={bookErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={bookForm.title}
                onChange={(e) => updateBookForm({ title: e.target.value })}
                placeholder="Title"
                className={bookErrors.title ? 'border-destructive' : ''}
              />
              <FormFieldError message={bookErrors.title} />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                placeholder="Author"
              />
            </div>
            <div className="space-y-2">
              <Label>ISBN *</Label>
              <Input
                value={bookForm.isbn}
                onChange={(e) => updateBookForm({ isbn: e.target.value })}
                placeholder="978-81-7709-187-8"
                className={bookErrors.isbn ? 'border-destructive' : ''}
              />
              <FormFieldError message={bookErrors.isbn} />
            </div>
            <div className="space-y-2">
              <Label>Barcode *</Label>
              <Input
                value={bookForm.barcode}
                onChange={(e) => setBookForm({ ...bookForm, barcode: e.target.value })}
                placeholder="LIB-BARCODE-00923"
                className={bookErrors.barcode ? 'border-destructive' : ''}
              />
              <FormFieldError message={bookErrors.barcode} />
            </div>
            <div className="space-y-2">
              <Label>Category / rack</Label>
              <Input
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                placeholder="Category"
              />
            </div>
            <div className="space-y-2">
              <Label>Rack location</Label>
              <Input
                value={bookForm.rackLocation}
                onChange={(e) => setBookForm({ ...bookForm, rackLocation: e.target.value })}
                placeholder="Aisle 2, Shelf B-4"
              />
            </div>
            <div className="space-y-2">
              <Label>Total copies</Label>
              <Input
                type="number"
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                placeholder="Total copies"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => bookMut.mutate()} disabled={bookMut.isPending}>
              {bookMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue book</DialogTitle></DialogHeader>
          <Input value={issueForm.studentId} onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })} placeholder="Student ID" />
          <DialogFooter><Button onClick={() => issueMut.mutate()}>Issue</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Return book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={returnForm.issueId} onChange={(e) => setReturnForm({ ...returnForm, issueId: e.target.value })} placeholder="Issue ID" />
            <Input value={returnForm.bookId} onChange={(e) => setReturnForm({ ...returnForm, bookId: e.target.value })} placeholder="Book ID" />
            <Input value={returnForm.studentId} onChange={(e) => setReturnForm({ ...returnForm, studentId: e.target.value })} placeholder="Student ID" />
          </div>
          <DialogFooter><Button onClick={() => returnMut.mutate()}>Return</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

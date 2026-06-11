import { Button } from '@/components/ui/button'
import type { PaginatedMeta } from '@/types/api'

interface PaginationProps {
  meta?: PaginatedMeta
  page: number
  onPageChange: (page: number) => void
}

export function Pagination({ meta, page, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {meta.totalPages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

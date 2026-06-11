import { formatFieldErrors } from '@/lib/api-errors'

export function FormErrorSummary({ errors }: { errors: Record<string, string> }) {
  if (Object.keys(errors).length === 0) return null

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <p className="font-medium">Please fix the following:</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FormErrorSummaryText({ errors }: { errors: Record<string, string> }) {
  if (Object.keys(errors).length === 0) return null
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive whitespace-pre-line">
      {formatFieldErrors(errors)}
    </div>
  )
}

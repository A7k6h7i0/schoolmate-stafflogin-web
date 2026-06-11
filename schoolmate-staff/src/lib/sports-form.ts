import { z } from 'zod'

export const MONGO_OBJECT_ID = /^[a-f0-9]{24}$/i

export const createSportSchema = z.object({
  name: z.string().trim().min(1, 'Sport name is required'),
  instructorId: z.string().regex(MONGO_OBJECT_ID, 'Select a coach from the staff list'),
  description: z.string().optional(),
  maxParticipants: z.string().optional(),
})

export type CreateSportForm = z.infer<typeof createSportSchema>

/** Live API uses activityName + instructorId (Swagger shows name + coachId). */
export function buildCreateSportPayload(form: CreateSportForm) {
  const activityName = form.name.trim()
  const instructorId = form.instructorId.trim()
  const max = form.maxParticipants ? Number(form.maxParticipants) : undefined

  const payload: Record<string, unknown> = {
    activityName,
    instructorId,
    name: activityName,
    coachId: instructorId,
  }

  if (form.description?.trim()) payload.description = form.description.trim()
  if (max != null && !Number.isNaN(max)) payload.maxParticipants = max

  return payload
}

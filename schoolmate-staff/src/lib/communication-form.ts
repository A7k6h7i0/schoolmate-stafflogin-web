import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Message is required'),
  audienceScope: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS']),
})

export type CreateAnnouncementForm = z.infer<typeof createAnnouncementSchema>

/** Live API uses content + audienceScope; form may use body/audience aliases. */
export function buildCreateAnnouncementPayload(form: CreateAnnouncementForm) {
  const title = form.title.trim()
  const content = form.content.trim()
  const audienceScope = form.audienceScope

  return {
    title,
    content,
    body: content,
    message: content,
    audienceScope,
    audience: audienceScope,
    targetAudience: audienceScope,
  }
}

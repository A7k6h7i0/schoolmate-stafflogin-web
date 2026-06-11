import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { Announcement, Meeting } from '@/types/entities'
import {
  buildCreateAnnouncementPayload,
  type CreateAnnouncementForm,
} from '@/lib/communication-form'

function normalizeAnnouncement(raw: Record<string, unknown>): Announcement {
  const id = raw.id ?? raw._id ?? raw.announcementId
  const content = raw.content ?? raw.body ?? raw.message
  return {
    id: id != null ? String(id) : '',
    title: String(raw.title ?? 'Untitled'),
    body: content != null ? String(content) : undefined,
    content: content != null ? String(content) : undefined,
    audience: String(raw.audienceScope ?? raw.audience ?? raw.targetAudience ?? ''),
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
  }
}

export async function listAnnouncements() {
  const { data } = await apiClient.get('/announcements', { params: { page: 1, limit: 50 } })
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map(normalizeAnnouncement).filter((announcement) => announcement.id)
}

export async function createAnnouncement(form: CreateAnnouncementForm) {
  const payload = buildCreateAnnouncementPayload(form)
  if (import.meta.env.DEV) {
    console.info('[communication] POST /announcements', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/announcements', payload)
  return unwrapData(data)
}

export async function createChannel(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/communication/channels', payload)
  return unwrapData(data)
}

export async function sendMessage(channelId: string, payload: { content: string }) {
  const { data } = await apiClient.post(`/communication/channels/${channelId}/messages`, payload)
  return unwrapData(data)
}

export async function getMessages(channelId: string) {
  const { data } = await apiClient.get(`/communication/channels/${channelId}/messages`)
  return unwrapList(data).items
}

export async function scheduleMeeting(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/communication/meetings/schedule', payload)
  return unwrapData(data)
}

export async function listMeetings() {
  const { data } = await apiClient.get('/communication/meetings', { params: { page: 1, limit: 50 } })
  return unwrapList<Meeting>(data).items
}

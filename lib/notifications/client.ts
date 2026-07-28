import type { MessageChannel, DeliveryStatus } from "@/types/database.types"

export interface MessageItem {
  id: string
  wedding_id: string
  guest_id: string | null
  channel: MessageChannel
  recipient: string
  subject: string | null
  body: string
  status: DeliveryStatus
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  source?: "api" | "local"
}

export interface NotificationItem {
  id: string
  wedding_id: string | null
  type: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

export class NotificationClientError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number) {
    super(message)
    this.name = "NotificationClientError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const body = await response.json().catch(() => null) as { data?: T; error?: { code?: string; message?: string } } | null
  if (!response.ok || body?.data === undefined) throw new NotificationClientError(body?.error?.message ?? "La requête n’a pas abouti.", body?.error?.code ?? "REQUEST_FAILED", response.status)
  return body.data
}

export async function listMessages(weddingId: string) {
  return request<{ items: MessageItem[] }>(`/api/weddings/${encodeURIComponent(weddingId)}/messages`)
}

export async function queueMessage(weddingId: string, input: { guestId?: string | null; channel: MessageChannel; recipient: string; subject?: string | null; body?: string; template?: string; scheduledAt?: string | null }) {
  return request<MessageItem>(`/api/weddings/${encodeURIComponent(weddingId)}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) })
}

export async function listNotifications(weddingId: string) {
  return request<{ items: NotificationItem[] }>(`/api/weddings/${encodeURIComponent(weddingId)}/notifications`)
}

export async function markNotificationRead(weddingId: string, notificationId: string) {
  return request<NotificationItem>(`/api/weddings/${encodeURIComponent(weddingId)}/notifications/${encodeURIComponent(notificationId)}`, { method: "PATCH" })
}

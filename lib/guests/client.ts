import type { Guest, RSVPStatus } from "@/components/guests/types"

export interface GuestApiRow {
  id: string
  wedding_id: string
  group_id: string | null
  table_id: string | null
  first_name: string
  last_name: string
  middle_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  category: string | null
  language: string
  allowed_companions: number
  rsvp_status: "pending" | "accepted" | "declined" | "maybe"
  invitation_status: string
  checked_in_at: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export class GuestClientError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number, public readonly details?: unknown) {
    super(message)
    this.name = "GuestClientError"
  }
}

function toUiRsvp(value: GuestApiRow["rsvp_status"]): RSVPStatus {
  return value === "accepted" ? "present" : value === "declined" ? "absent" : value
}

function toApiRsvp(value: RSVPStatus | undefined): GuestApiRow["rsvp_status"] {
  return value === "present" ? "accepted" : value === "absent" ? "declined" : value ?? "pending"
}

export function fromGuestApiRow(row: GuestApiRow): Guest {
  return {
    id: row.id,
    lastName: row.last_name,
    middleName: row.middle_name ?? undefined,
    firstName: row.first_name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    city: row.city ?? undefined,
    category: row.category ?? undefined,
    tableNumber: null,
    guestsCount: row.allowed_companions,
    rsvpStatus: toUiRsvp(row.rsvp_status),
    message: row.notes ?? undefined,
    qrCode: row.id,
    inviteCode: row.id.slice(0, 8).toUpperCase(),
    checkedInAt: row.checked_in_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toGuestApiPayload(guest: Guest) {
  return {
    firstName: guest.firstName,
    lastName: guest.lastName,
    middleName: guest.middleName ?? null,
    email: guest.email ?? null,
    phone: guest.phone ?? null,
    city: guest.city ?? null,
    category: guest.category ?? null,
    language: "fr",
    allowedCompanions: guest.guestsCount ?? 0,
    notes: guest.message ?? null,
    tags: guest.category ? [guest.category] : [],
    rsvpStatus: toApiRsvp(guest.rsvpStatus),
    checkedInAt: guest.checkedInAt ?? null,
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } })
  let body: { data?: T; error?: { code?: string; message?: string; details?: unknown } }
  try { body = await response.json() } catch { throw new GuestClientError("Réponse serveur invalide.", "INVALID_RESPONSE", response.status) }
  if (!response.ok || !body.data) throw new GuestClientError(body.error?.message ?? "La requête n’a pas abouti.", body.error?.code ?? "REQUEST_FAILED", response.status, body.error?.details)
  return body.data
}

export async function listGuests(weddingId: string, search = "") {
  const params = new URLSearchParams({ pageSize: "100" })
  if (search) params.set("search", search)
  return request<{ items: GuestApiRow[] }>(`/api/weddings/${encodeURIComponent(weddingId)}/guests?${params.toString()}`)
}

export async function createGuest(weddingId: string, guest: Guest) {
  return request<GuestApiRow>(`/api/weddings/${encodeURIComponent(weddingId)}/guests`, { method: "POST", body: JSON.stringify(toGuestApiPayload(guest)) })
}

export async function updateGuest(weddingId: string, guest: Guest) {
  return request<GuestApiRow>(`/api/weddings/${encodeURIComponent(weddingId)}/guests/${encodeURIComponent(guest.id)}`, { method: "PATCH", body: JSON.stringify(toGuestApiPayload(guest)) })
}

export async function checkInGuest(weddingId: string, guestId: string, checkedInAt = new Date().toISOString()) {
  return request<GuestApiRow>(`/api/weddings/${encodeURIComponent(weddingId)}/guests/${encodeURIComponent(guestId)}`, {
    method: "PATCH",
    body: JSON.stringify({ checkedInAt }),
  })
}

export async function deleteGuest(weddingId: string, guestId: string) {
  return request<{ id: string; deleted: boolean }>(`/api/weddings/${encodeURIComponent(weddingId)}/guests/${encodeURIComponent(guestId)}`, { method: "DELETE" })
}

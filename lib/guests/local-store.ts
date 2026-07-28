import type { Guest } from "@/components/guests/types"
import { mockGuests } from "@/components/guests/mockGuests"

const key = (weddingId: string) => `ndoa:guests:v1:${weddingId}`

export function readLocalGuests(weddingId: string): Guest[] {
  if (typeof window === "undefined") return []
  try {
    const stored = JSON.parse(window.localStorage.getItem(key(weddingId)) ?? "null")
    if (Array.isArray(stored)) return stored as Guest[]
  } catch { /* ignore malformed demo storage */ }
  const initial = weddingId === "demo-wedding" ? mockGuests : []
  writeLocalGuests(weddingId, initial)
  return initial
}

function writeLocalGuests(weddingId: string, guests: Guest[]) {
  window.localStorage.setItem(key(weddingId), JSON.stringify(guests))
}

export function saveLocalGuest(weddingId: string, guest: Guest) {
  const current = readLocalGuests(weddingId)
  const next = current.some((item) => item.id === guest.id) ? current.map((item) => item.id === guest.id ? guest : item) : [guest, ...current]
  writeLocalGuests(weddingId, next)
  return guest
}

export function deleteLocalGuest(weddingId: string, guestId: string) {
  const current = readLocalGuests(weddingId)
  writeLocalGuests(weddingId, current.filter((guest) => guest.id !== guestId))
}

export function duplicateLocalGuest(weddingId: string, guest: Guest) {
  const now = new Date().toISOString()
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  const copy: Guest = { ...guest, id: `local-${id}`, lastName: `${guest.lastName} (copie)`, inviteCode: undefined, qrCode: undefined, createdAt: now, updatedAt: now }
  saveLocalGuest(weddingId, copy)
  return copy
}

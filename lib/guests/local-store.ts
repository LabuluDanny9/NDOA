import type { Guest } from "@/components/guests/types"

const key = (weddingId: string) => `ndoa:guests:v1:${weddingId}`

function isLegacySeededDemoGuest(guest: Guest) {
  return (
    guest.email?.endsWith("@example.com") ||
    guest.qrCode?.startsWith("QRCODE") ||
    guest.inviteCode?.startsWith("INV-")
  )
}

export function readLocalGuests(weddingId: string): Guest[] {
  if (typeof window === "undefined") return []
  try {
    const stored = JSON.parse(window.localStorage.getItem(key(weddingId)) ?? "null")
    if (Array.isArray(stored)) {
      const guests = stored as Guest[]
      if (weddingId === "demo-wedding" && guests.some(isLegacySeededDemoGuest)) {
        const cleaned = guests.filter((guest) => !isLegacySeededDemoGuest(guest))
        writeLocalGuests(weddingId, cleaned)
        return cleaned
      }
      return guests
    }
  } catch { /* ignore malformed demo storage */ }
  return []
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

export function markLocalGuestCheckedIn(weddingId: string, guestId: string, checkedInAt = new Date().toISOString()) {
  const current = readLocalGuests(weddingId)
  const updated = current.map((guest) => guest.id === guestId ? { ...guest, checkedInAt, updatedAt: checkedInAt } : guest)
  writeLocalGuests(weddingId, updated)
  return updated.find((guest) => guest.id === guestId) ?? null
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

import type { Guest } from "@/components/guests/types"
import { readLocalGuests } from "@/lib/guests/local-store"
import { listWeddings } from "@/lib/weddings/client"
import { readLocalWeddings as readLocalWeddingRecords } from "@/lib/weddings/local-store"

export interface DashboardData {
  weddingCount: number
  weddingId: string | null
  weddingName: string | null
  weddingDate: string | null
  daysToWedding: number | null
  guests: { total: number; accepted: number; declined: number; pending: number; maybe: number }
  upcomingEvents: Array<{ id: string; title: string; starts_at: string; venue_name: string | null; city: string | null }>
  activities: Array<{ id: number; entity_type: string; action: string; occurred_at: string }>
  notifications: Array<{ id: string; type: string; title: string; body: string; read_at: string | null; created_at: string }>
  source: "api" | "local"
}

async function requestDashboard(weddingId: string) {
  const response = await fetch(`/api/weddings/${encodeURIComponent(weddingId)}/dashboard`)
  const body = await response.json() as { data?: Omit<DashboardData, "weddingCount" | "weddingId" | "source">; error?: { code?: string; message?: string } }
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Dashboard indisponible")
  return body.data
}

function aggregateLocalGuests(guests: Guest[]) {
  return {
    total: guests.length,
    accepted: guests.filter((guest) => guest.rsvpStatus === "present").length,
    declined: guests.filter((guest) => guest.rsvpStatus === "absent").length,
    pending: guests.filter((guest) => guest.rsvpStatus === "pending" || !guest.rsvpStatus).length,
    maybe: guests.filter((guest) => guest.rsvpStatus === "maybe").length,
  }
}

function daysUntil(date: string | null | undefined) {
  if (!date) return null
  const target = new Date(`${date}T00:00:00`).getTime()
  if (Number.isNaN(target)) return null
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000))
}

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    const response = await listWeddings()
    const first = response.items[0]
    if (!first) return { weddingCount: 0, weddingId: null, weddingName: null, weddingDate: null, daysToWedding: null, guests: { total: 0, accepted: 0, declined: 0, pending: 0, maybe: 0 }, upcomingEvents: [], activities: [], notifications: [], source: "api" }
    const dashboard = await requestDashboard(first.id)
    return { ...dashboard, weddingCount: response.items.length, weddingId: first.id, weddingName: first.name, weddingDate: first.wedding_date, daysToWedding: daysUntil(first.wedding_date), source: "api" }
  } catch {
    const weddings = readLocalWeddingRecords()
    const first = weddings[0] ?? null
    const guests = first ? readLocalGuests(first.id) : []
    return {
      weddingCount: weddings.length,
      weddingId: first?.id ?? null,
      weddingName: first?.name ?? null,
      weddingDate: first?.weddingDate ?? null,
      daysToWedding: daysUntil(first?.weddingDate),
      guests: aggregateLocalGuests(guests),
      upcomingEvents: [],
      activities: guests.slice(0, 6).map((guest, index) => ({ id: index, entity_type: "guests", action: "created", occurred_at: guest.createdAt })),
      notifications: [],
      source: "local",
    }
  }
}

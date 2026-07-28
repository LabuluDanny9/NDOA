import type { Json, TablesInsert, TablesUpdate } from "@/types/database.types"

export function toWeddingInsert(
  input: Record<string, unknown>,
  ownerId: string
): TablesInsert<"weddings"> {
  return {
    owner_id: ownerId,
    name: input.name as string,
    slug: input.slug as string,
    partner_one_name: input.partnerOneName as string,
    partner_two_name: input.partnerTwoName as string,
    wedding_date: (input.weddingDate as string | null | undefined) ?? null,
    ceremony_time: (input.ceremonyTime as string | null | undefined) ?? null,
    timezone: input.timezone as string,
    description: (input.description as string | null | undefined) ?? null,
    theme: input.theme as Json,
    settings: input.settings as Json,
  }
}

export function toWeddingUpdate(input: Record<string, unknown>): TablesUpdate<"weddings"> {
  const update: TablesUpdate<"weddings"> = {}
  if (input.name !== undefined) update.name = input.name as string
  if (input.slug !== undefined) update.slug = input.slug as string
  if (input.partnerOneName !== undefined) update.partner_one_name = input.partnerOneName as string
  if (input.partnerTwoName !== undefined) update.partner_two_name = input.partnerTwoName as string
  if (input.weddingDate !== undefined) update.wedding_date = input.weddingDate as string | null
  if (input.ceremonyTime !== undefined) update.ceremony_time = input.ceremonyTime as string | null
  if (input.timezone !== undefined) update.timezone = input.timezone as string
  if (input.description !== undefined) update.description = input.description as string | null
  if (input.theme !== undefined) update.theme = input.theme as Json
  if (input.settings !== undefined) update.settings = input.settings as Json
  if (input.status !== undefined) {
    update.status = input.status as TablesUpdate<"weddings">["status"]
    update.published_at = input.status === "published" ? new Date().toISOString() : null
  }
  return update
}

export function toEventInsert(input: Record<string, unknown>, weddingId: string): TablesInsert<"events"> {
  return {
    wedding_id: weddingId,
    type: input.type as TablesInsert<"events">["type"],
    title: input.title as string,
    description: (input.description as string | null | undefined) ?? null,
    starts_at: input.startsAt as string,
    ends_at: (input.endsAt as string | null | undefined) ?? null,
    venue_name: (input.venueName as string | null | undefined) ?? null,
    address: (input.address as string | null | undefined) ?? null,
    city: (input.city as string | null | undefined) ?? null,
    country: (input.country as string | null | undefined) ?? null,
    latitude: (input.latitude as number | null | undefined) ?? null,
    longitude: (input.longitude as number | null | undefined) ?? null,
    maps_url: (input.mapsUrl as string | null | undefined) ?? null,
    position: input.position as number,
    is_public: input.isPublic as boolean,
  }
}

export function toEventUpdate(input: Record<string, unknown>): TablesUpdate<"events"> {
  const update: TablesUpdate<"events"> = {}
  const mappings = {
    type: "type", title: "title", description: "description", startsAt: "starts_at", endsAt: "ends_at",
    venueName: "venue_name", address: "address", city: "city", country: "country", latitude: "latitude",
    longitude: "longitude", mapsUrl: "maps_url", position: "position", isPublic: "is_public",
  } as const
  for (const [source, target] of Object.entries(mappings)) {
    if (input[source] !== undefined) (update as Record<string, unknown>)[target] = input[source]
  }
  return update
}

export function toProgramInsert(input: Record<string, unknown>, weddingId: string): TablesInsert<"programs"> {
  return {
    wedding_id: weddingId,
    event_id: (input.eventId as string | null | undefined) ?? null,
    title: input.title as string,
    description: (input.description as string | null | undefined) ?? null,
    scheduled_at: input.scheduledAt as string,
    duration_minutes: (input.durationMinutes as number | null | undefined) ?? null,
    location: (input.location as string | null | undefined) ?? null,
    position: input.position as number,
    is_public: input.isPublic as boolean,
  }
}

export function toProgramUpdate(input: Record<string, unknown>): TablesUpdate<"programs"> {
  const update: TablesUpdate<"programs"> = {}
  const mappings = {
    eventId: "event_id", title: "title", description: "description", scheduledAt: "scheduled_at",
    durationMinutes: "duration_minutes", location: "location", position: "position", isPublic: "is_public",
  } as const
  for (const [source, target] of Object.entries(mappings)) {
    if (input[source] !== undefined) (update as Record<string, unknown>)[target] = input[source]
  }
  return update
}

export function toGuestInsert(input: Record<string, unknown>, weddingId: string, userId: string): TablesInsert<"guests"> {
  return {
    wedding_id: weddingId, invited_by: userId,
    group_id: (input.groupId as string | null | undefined) ?? null,
    table_id: (input.tableId as string | null | undefined) ?? null,
    first_name: input.firstName as string, last_name: input.lastName as string,
    middle_name: (input.middleName as string | null | undefined) ?? null,
    email: (input.email as string | null | undefined) ?? null, phone: (input.phone as string | null | undefined) ?? null,
    city: (input.city as string | null | undefined) ?? null, category: (input.category as string | null | undefined) ?? null,
    language: input.language as string, allowed_companions: input.allowedCompanions as number,
    notes: (input.notes as string | null | undefined) ?? null, tags: input.tags as string[],
  }
}

export function toGuestUpdate(input: Record<string, unknown>): TablesUpdate<"guests"> {
  const update: TablesUpdate<"guests"> = {}
  const mappings = {
    groupId: "group_id", tableId: "table_id", firstName: "first_name", lastName: "last_name", middleName: "middle_name",
    email: "email", phone: "phone", city: "city", category: "category", language: "language", allowedCompanions: "allowed_companions",
    notes: "notes", tags: "tags", rsvpStatus: "rsvp_status", invitationStatus: "invitation_status",
  } as const
  for (const [source, target] of Object.entries(mappings)) {
    if (input[source] !== undefined) (update as Record<string, unknown>)[target] = input[source]
  }
  return update
}

export function toGuestGroupInsert(input: Record<string, unknown>, weddingId: string): TablesInsert<"guest_groups"> {
  return { wedding_id: weddingId, name: input.name as string, description: (input.description as string | null | undefined) ?? null, color: (input.color as string | null | undefined) ?? null, position: input.position as number }
}

export function toGuestGroupUpdate(input: Record<string, unknown>): TablesUpdate<"guest_groups"> {
  return { ...(input.name !== undefined ? { name: input.name as string } : {}), ...(input.description !== undefined ? { description: input.description as string | null } : {}), ...(input.color !== undefined ? { color: input.color as string | null } : {}), ...(input.position !== undefined ? { position: input.position as number } : {}) }
}

export function toGuestTableInsert(input: Record<string, unknown>, weddingId: string): TablesInsert<"guest_tables"> {
  return { wedding_id: weddingId, name: input.name as string, capacity: input.capacity as number, shape: (input.shape as string | null | undefined) ?? null, location: (input.location as string | null | undefined) ?? null, position: input.position as number }
}

export function toGuestTableUpdate(input: Record<string, unknown>): TablesUpdate<"guest_tables"> {
  return { ...(input.name !== undefined ? { name: input.name as string } : {}), ...(input.capacity !== undefined ? { capacity: input.capacity as number } : {}), ...(input.shape !== undefined ? { shape: input.shape as string | null } : {}), ...(input.location !== undefined ? { location: input.location as string | null } : {}), ...(input.position !== undefined ? { position: input.position as number } : {}) }
}

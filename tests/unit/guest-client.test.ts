import { describe, expect, it } from "vitest"
import { fromGuestApiRow, toGuestApiPayload } from "@/lib/guests/client"

const row = {
  id: "00000000-0000-0000-0000-000000000001",
  wedding_id: "00000000-0000-0000-0000-000000000010",
  group_id: null,
  table_id: null,
  first_name: "Ariane",
  last_name: "Mukeba",
  middle_name: null,
  email: "ariane@example.com",
  phone: "+243 999000111",
  city: "Lubumbashi",
  category: "Family",
  language: "fr",
  allowed_companions: 2,
  rsvp_status: "accepted" as const,
  invitation_status: "sent",
  checked_in_at: null,
  notes: "Bienvenue",
  tags: ["Family"],
  created_at: "2026-07-28T00:00:00Z",
  updated_at: "2026-07-28T00:00:00Z",
}

describe("adaptateur du module invités", () => {
  it("convertit les statuts RSVP SQL vers le vocabulaire UI", () => {
    expect(fromGuestApiRow(row)).toMatchObject({ firstName: "Ariane", lastName: "Mukeba", rsvpStatus: "present", guestsCount: 2 })
  })

  it("sérialise un invité UI sans exposer les champs locaux", () => {
    const payload = toGuestApiPayload({
      id: "local",
      firstName: "Ariane",
      lastName: "Mukeba",
      category: "VIP",
      guestsCount: 3,
      rsvpStatus: "absent",
      createdAt: "2026-07-28T00:00:00Z",
      updatedAt: "2026-07-28T00:00:00Z",
    })
    expect(payload).toMatchObject({ firstName: "Ariane", lastName: "Mukeba", allowedCompanions: 3, rsvpStatus: "declined", tags: ["VIP"] })
    expect(payload).not.toHaveProperty("id")
  })
})

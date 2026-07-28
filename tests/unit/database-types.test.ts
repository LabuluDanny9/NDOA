import { describe, expect, it } from "vitest"
import type {
  Enums,
  Tables,
  TablesInsert,
} from "@/types/database.types"

const weddingInsert = {
  owner_id: "00000000-0000-0000-0000-000000000001",
  name: "NDOA de Danny et Julie",
  slug: "danny-et-julie",
  partner_one_name: "Danny",
  partner_two_name: "Julie",
} satisfies TablesInsert<"weddings">

const guestInsert = {
  wedding_id: "00000000-0000-0000-0000-000000000010",
  first_name: "Ariane",
  last_name: "Mukeba",
} satisfies TablesInsert<"guests">

describe("types Database", () => {
  it("rend les colonnes à défaut optionnelles à l'insertion", () => {
    expect(weddingInsert.slug).toBe("danny-et-julie")
    expect(guestInsert.first_name).toBe("Ariane")
  })

  it("expose les lignes et enums métier", () => {
    const role: Enums<"app_role"> = "organizer"
    const response: Tables<"rsvps">["response"] = "accepted"

    expect(role).toBe("organizer")
    expect(response).toBe("accepted")
  })
})

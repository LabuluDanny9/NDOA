import { describe, expect, it } from "vitest"
import { defaultWeddingValues } from "@/components/wedding/wedding-form-schema"
import {
  formValuesFromWeddingApi,
  fromWeddingApiRow,
  toWeddingApiPayload,
  weddingSlug,
} from "@/lib/weddings/client"

describe("adaptateur du module mariage", () => {
  it("produit un slug stable et compatible avec les contraintes SQL", () => {
    expect(weddingSlug({ weddingName: "Mariage d'Élodie & José", groomName: "José", brideName: "Élodie" })).toBe("mariage-d-elodie-jose")
  })

  it("convertit le formulaire complet vers le payload REST", () => {
    const values = {
      ...defaultWeddingValues,
      weddingName: "NDOA Danny Julie",
      groomName: "Danny",
      brideName: "Julie",
      date: "2026-08-15",
      time: "10:30",
      story: "Une histoire de rencontre qui mérite une belle célébration.",
      venueName: "Le Palmier",
      city: "Lubumbashi",
    }
    const payload = toWeddingApiPayload(values)
    expect(payload).toMatchObject({
      name: "NDOA Danny Julie",
      slug: "ndoa-danny-julie",
      partnerOneName: "Danny",
      weddingDate: "2026-08-15",
      ceremonyTime: "10:30",
      description: values.story,
    })
    expect(payload.settings).toMatchObject({ venueName: "Le Palmier", city: "Lubumbashi" })
  })

  it("reconstruit les valeurs d'édition à partir d'une ligne API", () => {
    const values = formValuesFromWeddingApi({
      id: "00000000-0000-0000-0000-000000000001",
      name: "NDOA",
      slug: "ndoa",
      partner_one_name: "Danny",
      partner_two_name: "Julie",
      wedding_date: "2026-08-15",
      status: "draft",
      description: "Notre histoire est longue et belle.",
      timezone: "Africa/Lubumbashi",
      created_at: "2026-07-28T00:00:00Z",
      updated_at: "2026-07-28T00:00:00Z",
      theme: { primaryColor: "#123456", style: "Modern" },
      settings: { city: "Lubumbashi", maxGuests: 3, allowChildren: true },
    })
    expect(values).toMatchObject({ weddingName: "NDOA", date: "2026-08-15", primaryColor: "#123456", style: "Modern", city: "Lubumbashi", maxGuests: 3, allowChildren: true })
  })

  it("normalise une ligne API en résumé d'interface", () => {
    const summary = fromWeddingApiRow({
      id: "00000000-0000-0000-0000-000000000001",
      name: "NDOA",
      slug: "ndoa",
      partner_one_name: "Danny",
      partner_two_name: "Julie",
      wedding_date: null,
      status: "published",
      description: null,
      timezone: "Africa/Lubumbashi",
      created_at: "2026-07-28T00:00:00Z",
      updated_at: "2026-07-28T00:00:00Z",
    })
    expect(summary).toMatchObject({ id: "00000000-0000-0000-0000-000000000001", status: "published", source: "api" })
  })
})

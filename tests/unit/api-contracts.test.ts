import { describe, expect, it } from "vitest"
import { ApiError, apiErrorFromSupabase, parseWithSchema } from "@/lib/api/errors"
import { escapePostgrestSearch, paginationMeta, parsePagination, parseSearch, parseSort } from "@/lib/api/pagination"
import { eventCreateSchema, guestCreateSchema, weddingCreateSchema } from "@/lib/api/schemas"

describe("contrats API", () => {
  it("valide et normalise les paramètres de pagination", () => {
    const params = new URLSearchParams("page=2&pageSize=25&sort=name&order=asc")
    const pagination = parsePagination(params)
    expect(pagination).toMatchObject({ page: 2, pageSize: 25, from: 25, to: 49 })
    expect(parseSort(params, ["name", "created_at"] as const, "created_at")).toBe("name")
  })

  it("rejette les paramètres hors limites et les recherches trop longues", () => {
    expect(() => parsePagination(new URLSearchParams("page=0"))).toThrow(ApiError)
    expect(() => parseSearch(new URLSearchParams(`search=${"x".repeat(101)}`))).toThrow(ApiError)
    expect(escapePostgrestSearch("A,B%_\\")).toBe("AB\\%\\_\\\\")
  })

  it("produit des métadonnées cohérentes quand le total est inconnu", () => {
    const pagination = parsePagination(new URLSearchParams("page=3&pageSize=10"))
    expect(paginationMeta(pagination, null)).toEqual({ page: 3, pageSize: 10, total: 0, totalPages: 0 })
  })

  it("convertit les erreurs Supabase en contrat HTTP stable", () => {
    expect(apiErrorFromSupabase({ code: "23505" }).code).toBe("CONFLICT")
    expect(apiErrorFromSupabase({ code: "PGRST116" }).status).toBe(404)
    expect(apiErrorFromSupabase({ code: "42501" }).code).toBe("FORBIDDEN")
  })

  it("valide les payloads métier avant toute écriture", () => {
    const wedding = parseWithSchema(weddingCreateSchema, {
      name: "NDOA Danny & Julie",
      slug: "danny-julie",
      partnerOneName: "Danny",
      partnerTwoName: "Julie",
    })
    expect(wedding.timezone).toBe("Africa/Lubumbashi")

    expect(() => parseWithSchema(eventCreateSchema, {
      type: "ceremony",
      title: "Cérémonie",
      startsAt: "2026-08-15T10:00:00+02:00",
      endsAt: "2026-08-15T09:00:00+02:00",
    })).toThrow(ApiError)

    const guest = parseWithSchema(guestCreateSchema, {
      firstName: "Ariane",
      lastName: "Mukeba",
    })
    expect(guest.tags).toEqual([])
  })
})

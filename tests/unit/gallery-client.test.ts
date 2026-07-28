import { afterEach, describe, expect, it, vi } from "vitest"
import { GalleryClientError, listPhotos } from "@/lib/gallery/client"

describe("contrat client galerie", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("construit la route tenant et mappe la réponse API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { items: [] } }), { status: 200 })))

    await expect(listPhotos("wedding/one")).resolves.toEqual({ items: [] })
    expect(fetch).toHaveBeenCalledWith("/api/weddings/wedding%2Fone/photos", undefined)
  })

  it("préserve le code et le statut d'une erreur API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Accès refusé" } }), { status: 403 })))

    const result = listPhotos("demo")
    await expect(result).rejects.toBeInstanceOf(GalleryClientError)
    await expect(result).rejects.toMatchObject({ code: "FORBIDDEN", status: 403, message: "Accès refusé" })
  })
})

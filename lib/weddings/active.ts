import { fromWeddingApiRow, listWeddings, type WeddingSummary } from "@/lib/weddings/client"
import { readLocalWeddings } from "@/lib/weddings/local-store"

export type ActiveWedding = {
  wedding: WeddingSummary | null
  source: "api" | "local"
}

export async function resolveActiveWedding(): Promise<ActiveWedding> {
  try {
    const response = await listWeddings()
    const first = response.items[0]
    if (first) return { wedding: fromWeddingApiRow(first), source: "api" }
    const local = readLocalWeddings()[0] ?? null
    return { wedding: local, source: local ? "local" : "api" }
  } catch {
    const local = readLocalWeddings()[0] ?? null
    return { wedding: local, source: "local" }
  }
}

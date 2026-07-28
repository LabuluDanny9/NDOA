import { type NextRequest } from "next/server"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { requireApiContext } from "@/lib/api/context"
import { escapePostgrestSearch, paginationMeta, parseAscending, parsePagination, parseSearch, parseSort } from "@/lib/api/pagination"
import { weddingCreateSchema } from "@/lib/api/schemas"
import { toWeddingInsert } from "@/lib/api/serializers"

const WEDDING_SORTS = ["name", "created_at", "wedding_date", "updated_at"] as const

export async function GET(request: NextRequest) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const searchParams = request.nextUrl.searchParams
    const pagination = parsePagination(searchParams)
    const search = parseSearch(searchParams)
    const sort = parseSort(searchParams, WEDDING_SORTS, "updated_at")
    const ascending = parseAscending(searchParams)
    let query = supabase.from("weddings").select("*", { count: "exact" }).order(sort, { ascending }).range(pagination.from, pagination.to)
    if (search) {
      const escaped = escapePostgrestSearch(search)
      query = query.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
    }
    const { data, error, count } = await query
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: data ?? [], pagination: paginationMeta(pagination, count) }, requestId)
  })
}

export async function POST(request: NextRequest) {
  return withApiErrors(async (requestId) => {
    const { supabase, claims } = await requireApiContext()
    const input = parseWithSchema(weddingCreateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("weddings").insert(toWeddingInsert(input, claims.sub)).select("*").single()
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse(data, requestId, { status: 201 })
  })
}

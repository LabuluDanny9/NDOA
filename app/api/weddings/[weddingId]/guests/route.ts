import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { escapePostgrestSearch, paginationMeta, parseAscending, parsePagination, parseSearch, parseSort } from "@/lib/api/pagination"
import { guestCreateSchema, uuidSchema } from "@/lib/api/schemas"
import { toGuestInsert } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string }> }
const SORTS = ["last_name", "first_name", "created_at", "updated_at", "rsvp_status", "invitation_status"] as const

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const params = request.nextUrl.searchParams
    const pagination = parsePagination(params)
    const search = parseSearch(params)
    const sort = parseSort(params, SORTS, "last_name")
    const ascending = parseAscending(params)
    let query = supabase.from("guests").select("*", { count: "exact" }).eq("wedding_id", weddingId).order(sort, { ascending }).range(pagination.from, pagination.to)
    if (search) {
      const escaped = escapePostgrestSearch(search)
      query = query.or(`first_name.ilike.%${escaped}%,last_name.ilike.%${escaped}%,email.ilike.%${escaped}%`)
    }
    const { data, error, count } = await query
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: data ?? [], pagination: paginationMeta(pagination, count) }, requestId)
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase, claims } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const input = parseWithSchema(guestCreateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("guests").insert(toGuestInsert(input, weddingId, claims.sub)).select("*").single()
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse(data, requestId, { status: 201 })
  })
}

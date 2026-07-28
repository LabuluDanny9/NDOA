import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { paginationMeta, parseAscending, parsePagination, parseSort } from "@/lib/api/pagination"
import { programCreateSchema, uuidSchema } from "@/lib/api/schemas"
import { toProgramInsert } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string }> }
const SORTS = ["scheduled_at", "position", "created_at", "updated_at"] as const

export async function GET(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const pagination = parsePagination(request.nextUrl.searchParams)
    const sort = parseSort(request.nextUrl.searchParams, SORTS, "scheduled_at")
    const ascending = parseAscending(request.nextUrl.searchParams)
    const { data, error, count } = await supabase.from("programs").select("*", { count: "exact" }).eq("wedding_id", weddingId).order(sort, { ascending }).range(pagination.from, pagination.to)
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: data ?? [], pagination: paginationMeta(pagination, count) }, requestId)
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const input = parseWithSchema(programCreateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("programs").insert(toProgramInsert(input, weddingId)).select("*").single()
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse(data, requestId, { status: 201 })
  })
}

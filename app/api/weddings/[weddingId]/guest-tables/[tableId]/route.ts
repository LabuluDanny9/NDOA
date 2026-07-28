import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { guestTableSchema, uuidSchema } from "@/lib/api/schemas"
import { toGuestTableUpdate } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string; tableId: string }> }
async function readIds(context: RouteContext) {
  const { weddingId, tableId } = await context.params
  return { weddingId: parseWithSchema(uuidSchema, weddingId), tableId: parseWithSchema(uuidSchema, tableId) }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, tableId } = await readIds(context)
    const { data, error } = await supabase.from("guest_tables").select("*").eq("wedding_id", weddingId).eq("id", tableId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, tableId } = await readIds(context)
    const input = parseWithSchema(guestTableSchema.partial(), await readJsonBody(request))
    const { data, error } = await supabase.from("guest_tables").update(toGuestTableUpdate(input)).eq("wedding_id", weddingId).eq("id", tableId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, tableId } = await readIds(context)
    const { data, error } = await supabase.from("guest_tables").delete().eq("wedding_id", weddingId).eq("id", tableId).select("id").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse({ id: data.id, deleted: true }, requestId)
  })
}

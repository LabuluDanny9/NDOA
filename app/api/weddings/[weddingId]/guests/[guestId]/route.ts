import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { guestUpdateSchema, uuidSchema } from "@/lib/api/schemas"
import { toGuestUpdate } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string; guestId: string }> }

async function readIds(context: RouteContext) {
  const { weddingId, guestId } = await context.params
  return { weddingId: parseWithSchema(uuidSchema, weddingId), guestId: parseWithSchema(uuidSchema, guestId) }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, guestId } = await readIds(context)
    const { data, error } = await supabase.from("guests").select("*").eq("wedding_id", weddingId).eq("id", guestId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, guestId } = await readIds(context)
    const input = parseWithSchema(guestUpdateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("guests").update(toGuestUpdate(input)).eq("wedding_id", weddingId).eq("id", guestId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, guestId } = await readIds(context)
    const { data, error } = await supabase.from("guests").delete().eq("wedding_id", weddingId).eq("id", guestId).select("id").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse({ id: data.id, deleted: true }, requestId)
  })
}

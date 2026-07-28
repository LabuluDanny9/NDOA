import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { eventUpdateSchema, uuidSchema } from "@/lib/api/schemas"
import { toEventUpdate } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string; eventId: string }> }

async function readIds(context: RouteContext) {
  const { weddingId, eventId } = await context.params
  return { weddingId: parseWithSchema(uuidSchema, weddingId), eventId: parseWithSchema(uuidSchema, eventId) }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, eventId } = await readIds(context)
    const { data, error } = await supabase.from("events").select("*").eq("wedding_id", weddingId).eq("id", eventId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, eventId } = await readIds(context)
    const input = parseWithSchema(eventUpdateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("events").update(toEventUpdate(input)).eq("wedding_id", weddingId).eq("id", eventId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, eventId } = await readIds(context)
    const { data, error } = await supabase.from("events").delete().eq("wedding_id", weddingId).eq("id", eventId).select("id").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse({ id: data.id, deleted: true }, requestId)
  })
}

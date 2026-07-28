import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { guestGroupSchema, uuidSchema } from "@/lib/api/schemas"
import { toGuestGroupUpdate } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string; groupId: string }> }
async function readIds(context: RouteContext) {
  const { weddingId, groupId } = await context.params
  return { weddingId: parseWithSchema(uuidSchema, weddingId), groupId: parseWithSchema(uuidSchema, groupId) }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, groupId } = await readIds(context)
    const { data, error } = await supabase.from("guest_groups").select("*").eq("wedding_id", weddingId).eq("id", groupId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, groupId } = await readIds(context)
    const input = parseWithSchema(guestGroupSchema.partial(), await readJsonBody(request))
    const { data, error } = await supabase.from("guest_groups").update(toGuestGroupUpdate(input)).eq("wedding_id", weddingId).eq("id", groupId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, groupId } = await readIds(context)
    const { data, error } = await supabase.from("guest_groups").delete().eq("wedding_id", weddingId).eq("id", groupId).select("id").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse({ id: data.id, deleted: true }, requestId)
  })
}

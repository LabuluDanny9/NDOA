import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { toWeddingUpdate } from "@/lib/api/serializers"
import { uuidSchema, weddingUpdateSchema } from "@/lib/api/schemas"

type RouteContext = { params: Promise<{ weddingId: string }> }

async function readWeddingId(context: RouteContext) {
  const { weddingId } = await context.params
  return parseWithSchema(uuidSchema, weddingId)
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = await readWeddingId(context)
    const { data, error } = await supabase.from("weddings").select("*").eq("id", weddingId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = await readWeddingId(context)
    const input = parseWithSchema(weddingUpdateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("weddings").update(toWeddingUpdate(input)).eq("id", weddingId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = await readWeddingId(context)
    const { data, error } = await supabase.from("weddings").delete().eq("id", weddingId).select("id").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse({ id: data.id, deleted: true }, requestId)
  })
}

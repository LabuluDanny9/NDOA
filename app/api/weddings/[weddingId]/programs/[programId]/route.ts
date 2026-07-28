import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { programUpdateSchema, uuidSchema } from "@/lib/api/schemas"
import { toProgramUpdate } from "@/lib/api/serializers"

type RouteContext = { params: Promise<{ weddingId: string; programId: string }> }

async function readIds(context: RouteContext) {
  const { weddingId, programId } = await context.params
  return { weddingId: parseWithSchema(uuidSchema, weddingId), programId: parseWithSchema(uuidSchema, programId) }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, programId } = await readIds(context)
    const { data, error } = await supabase.from("programs").select("*").eq("wedding_id", weddingId).eq("id", programId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, programId } = await readIds(context)
    const input = parseWithSchema(programUpdateSchema, await readJsonBody(request))
    const { data, error } = await supabase.from("programs").update(toProgramUpdate(input)).eq("wedding_id", weddingId).eq("id", programId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, programId } = await readIds(context)
    const { data, error } = await supabase.from("programs").delete().eq("wedding_id", weddingId).eq("id", programId).select("id").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse({ id: data.id, deleted: true }, requestId)
  })
}

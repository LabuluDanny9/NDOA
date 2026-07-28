import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { uuidSchema } from "@/lib/api/schemas"
import { z } from "zod"
import type { TablesUpdate } from "@/types/database.types"

type RouteContext = { params: Promise<{ weddingId: string; photoId: string }> }
const updateSchema = z.object({ position: z.number().int().min(0).max(10_000).optional(), altText: z.string().trim().max(500).nullable().optional(), caption: z.string().trim().max(1000).nullable().optional() })

async function readIds(context: RouteContext) {
  const { weddingId, photoId } = await context.params
  return { weddingId: parseWithSchema(uuidSchema, weddingId), photoId: parseWithSchema(uuidSchema, photoId) }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, photoId } = await readIds(context)
    const input = parseWithSchema(updateSchema, await readJsonBody(request))
    const update: TablesUpdate<"photos"> = {}
    if (input.position !== undefined) update.position = input.position
    if (input.altText !== undefined) update.alt_text = input.altText
    if (input.caption !== undefined) update.caption = input.caption
    const { data, error } = await supabase.from("photos").update(update).eq("wedding_id", weddingId).eq("id", photoId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, photoId } = await readIds(context)
    const existing = await supabase.from("photos").select("id,storage_path").eq("wedding_id", weddingId).eq("id", photoId).maybeSingle()
    if (existing.error) throw apiErrorFromSupabase(existing.error)
    if (!existing.data) throw apiErrorFromSupabase({ code: "PGRST116" })
    const { error: storageError } = await supabase.storage.from("wedding-media").remove([existing.data.storage_path])
    if (storageError) throw apiErrorFromSupabase(storageError)
    const { error } = await supabase.from("photos").delete().eq("wedding_id", weddingId).eq("id", photoId)
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ id: photoId, deleted: true }, requestId)
  })
}

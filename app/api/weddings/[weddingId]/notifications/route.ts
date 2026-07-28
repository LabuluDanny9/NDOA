import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, withApiErrors } from "@/lib/api/errors"
import { uuidSchema } from "@/lib/api/schemas"

type RouteContext = { params: Promise<{ weddingId: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const { data, error } = await supabase.from("notifications").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }).limit(50)
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: data ?? [] }, requestId)
  })
}

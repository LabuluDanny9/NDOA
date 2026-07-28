import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, withApiErrors } from "@/lib/api/errors"
import { uuidSchema } from "@/lib/api/schemas"

type RouteContext = { params: Promise<{ weddingId: string; notificationId: string }> }

export async function PATCH(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const { weddingId, notificationId } = await context.params
    const parsedWeddingId = parseWithSchema(uuidSchema, weddingId)
    const parsedNotificationId = parseWithSchema(uuidSchema, notificationId)
    const { data, error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("wedding_id", parsedWeddingId).eq("id", parsedNotificationId).select("*").maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    return apiResponse(data, requestId)
  })
}

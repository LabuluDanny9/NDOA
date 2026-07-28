import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { messageCreateSchema, uuidSchema } from "@/lib/api/schemas"
import { renderNotificationTemplate, type NotificationTemplateKey } from "@/lib/notifications/templates"

type RouteContext = { params: Promise<{ weddingId: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const { data, error } = await supabase.from("messages").select("*").eq("wedding_id", weddingId).order("created_at", { ascending: false }).limit(100)
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: data ?? [] }, requestId)
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase, claims } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const input = parseWithSchema(messageCreateSchema, await readJsonBody(request))
    const rendered = input.template ? renderNotificationTemplate(input.template as NotificationTemplateKey, {}) : null
    const body = input.body ?? rendered?.body ?? ""
    const subject = input.subject ?? rendered?.subject ?? null
    const { data, error } = await supabase.from("messages").insert({
      wedding_id: weddingId,
      guest_id: input.guestId ?? null,
      created_by: claims.sub,
      channel: input.channel,
      recipient: input.recipient,
      subject,
      body,
      status: "queued",
      scheduled_at: input.scheduledAt ?? null,
    }).select("*").single()
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse(data, requestId, { status: 201 })
  })
}

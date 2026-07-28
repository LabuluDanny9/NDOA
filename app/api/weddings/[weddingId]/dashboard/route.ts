import { type NextRequest } from "next/server"
import { requireApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, parseWithSchema, withApiErrors } from "@/lib/api/errors"
import { uuidSchema } from "@/lib/api/schemas"

type RouteContext = { params: Promise<{ weddingId: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const [total, accepted, declined, pending, maybe, events, activities, notifications] = await Promise.all([
      supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId),
      supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).eq("rsvp_status", "accepted"),
      supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).eq("rsvp_status", "declined"),
      supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).eq("rsvp_status", "pending"),
      supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", weddingId).eq("rsvp_status", "maybe"),
      supabase.from("events").select("id,type,title,starts_at,ends_at,venue_name,city,is_public").eq("wedding_id", weddingId).order("starts_at", { ascending: true }).limit(8),
      supabase.from("activity_logs").select("id,entity_type,action,occurred_at,actor_user_id").eq("wedding_id", weddingId).order("occurred_at", { ascending: false }).limit(8),
      supabase.from("notifications").select("id,type,title,body,read_at,created_at").eq("wedding_id", weddingId).order("created_at", { ascending: false }).limit(8),
    ])
    const firstError = [total, accepted, declined, pending, maybe, events, activities, notifications].find((result) => result.error)?.error
    if (firstError) throw apiErrorFromSupabase(firstError)
    return apiResponse({
      guests: {
        total: total.count ?? 0,
        accepted: accepted.count ?? 0,
        declined: declined.count ?? 0,
        pending: pending.count ?? 0,
        maybe: maybe.count ?? 0,
      },
      upcomingEvents: events.data ?? [],
      activities: activities.data ?? [],
      notifications: notifications.data ?? [],
    }, requestId)
  })
}

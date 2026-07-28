import { type NextRequest } from "next/server"
import { z } from "zod"
import { ApiError, apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const slugSchema = z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const rsvpSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254),
  response: z.enum(["pending", "accepted", "declined", "maybe"]),
  companionsCount: z.number().int().min(0).max(20).default(0),
  comments: z.string().trim().max(5000).optional().nullable(),
})
type RouteContext = { params: Promise<{ slug: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    if (!getOptionalSupabaseEnvironment()) throw ApiError.notConfigured()
    const slug = parseWithSchema(slugSchema, (await context.params).slug)
    const input = parseWithSchema(rsvpSchema, await readJsonBody(request))
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.rpc("submit_public_rsvp", {
      target_slug: slug,
      guest_full_name: input.fullName,
      guest_email: input.email,
      target_response: input.response,
      target_companions_count: input.companionsCount,
      target_comments: input.comments ?? null,
    })
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse(data, requestId, { status: 201 })
  })
}

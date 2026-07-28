import { type NextRequest } from "next/server"
import { ApiError, apiErrorFromSupabase, apiResponse, parseWithSchema, withApiErrors } from "@/lib/api/errors"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const slugSchema = z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    if (!getOptionalSupabaseEnvironment()) {
      throw ApiError.notConfigured()
    }
    const slug = parseWithSchema(slugSchema, (await context.params).slug)
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.rpc("get_public_invitation", { target_slug: slug })
    if (error) throw apiErrorFromSupabase(error)
    if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
      throw ApiError.notFound("Invitation introuvable ou non publiée.")
    }
    return apiResponse(data, requestId)
  })
}

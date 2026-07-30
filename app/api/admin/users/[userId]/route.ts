import { type NextRequest } from "next/server"
import { requireAdminApiContext } from "@/lib/api/context"
import { ApiError, apiErrorFromSupabase, apiResponse, parseWithSchema, readJsonBody, withApiErrors } from "@/lib/api/errors"
import { adminUserUpdateSchema, uuidSchema } from "@/lib/api/schemas"

type RouteContext = { params: Promise<{ userId: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase, claims } = await requireAdminApiContext()
    const userId = parseWithSchema(uuidSchema, (await context.params).userId)
    const input = parseWithSchema(adminUserUpdateSchema, await readJsonBody(request))
    if (userId === claims.sub && (input.role !== undefined && input.role !== "admin" || input.status !== undefined && input.status !== "active")) {
      throw ApiError.badRequest("Vous ne pouvez pas désactiver ou rétrograder votre propre compte.")
    }
    if (input.status !== undefined) {
      const { error } = await supabase.from("users").update({ status: input.status }).eq("id", userId)
      if (error) throw apiErrorFromSupabase(error)
    }
    if (input.role !== undefined) {
      const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: input.role, assigned_by: claims.sub }, { onConflict: "user_id" })
      if (error) throw apiErrorFromSupabase(error)
    }
    const { data, error } = await supabase.from("users").select("id,email,status,last_sign_in_at,created_at,updated_at").eq("id", userId).maybeSingle()
    if (error) throw apiErrorFromSupabase(error)
    if (!data) throw apiErrorFromSupabase({ code: "PGRST116" })
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle()
    return apiResponse({ ...data, role: role?.role ?? "organizer" }, requestId)
  })
}

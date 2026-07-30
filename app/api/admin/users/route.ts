import { requireAdminApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, withApiErrors } from "@/lib/api/errors"

export async function GET() {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireAdminApiContext()
    const [users, profiles, roles] = await Promise.all([
      supabase.from("users").select("id,email,status,last_sign_in_at,created_at,updated_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("user_id,display_name"),
      supabase.from("user_roles").select("user_id,role"),
    ])
    const firstError = [users, profiles, roles].find((result) => result.error)?.error
    if (firstError) throw apiErrorFromSupabase(firstError)
    const profileById = new Map((profiles.data ?? []).map((profile) => [profile.user_id, profile.display_name]))
    const roleById = new Map((roles.data ?? []).map((role) => [role.user_id, role.role]))
    return apiResponse({ items: (users.data ?? []).map((user) => ({ ...user, display_name: profileById.get(user.id) ?? user.email?.split("@")[0] ?? "Utilisateur", role: roleById.get(user.id) ?? "organizer" })) }, requestId)
  })
}

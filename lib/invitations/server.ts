import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { PublicInvitation } from "@/lib/invitations/types"

export async function getPublicInvitation(slug: string): Promise<PublicInvitation | null> {
  if (!getOptionalSupabaseEnvironment()) return null
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.rpc("get_public_invitation", { target_slug: slug })
  if (error) throw new Error(`Public invitation projection failed: ${error.message}`)
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) return null
  return data as unknown as PublicInvitation
}

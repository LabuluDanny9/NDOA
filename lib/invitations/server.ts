import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { PublicInvitation } from "@/lib/invitations/types"

export async function getPublicInvitation(slug: string): Promise<PublicInvitation | null> {
  if (!getOptionalSupabaseEnvironment()) return null
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.rpc("get_public_invitation", { target_slug: slug })
  if (error) throw new Error(`Public invitation projection failed: ${error.message}`)
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) return null
  const invitation = data as unknown as PublicInvitation
  const photos = await Promise.all(
    invitation.photos.map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("wedding-media")
        .createSignedUrl(photo.storagePath, 60 * 60 * 24 * 7)
      return { ...photo, url: signed?.signedUrl ?? null }
    }),
  )
  return { ...invitation, photos }
}

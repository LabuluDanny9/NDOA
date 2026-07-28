import { getAuthenticatedRole, type AppRole } from "@/lib/auth/roles"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type CurrentViewer = {
  id: string
  email?: string
  name: string
  avatarUrl?: string
  role: AppRole
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

export async function getCurrentViewer(): Promise<CurrentViewer | null> {
  if (!getOptionalSupabaseEnvironment()) {
    return null
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.getClaims()

    if (error || !data?.claims) {
      return null
    }

    const claims = data.claims
    const role = getAuthenticatedRole(claims)

    if (!role) {
      return null
    }

    const metadata = isRecord(claims.user_metadata)
      ? claims.user_metadata
      : {}
    const email = getOptionalString(claims.email)
    const name =
      getOptionalString(metadata.full_name) ??
      getOptionalString(metadata.name) ??
      email?.split("@")[0] ??
      "Utilisateur NDOA"

    return {
      id: claims.sub,
      email,
      name,
      avatarUrl:
        getOptionalString(metadata.avatar_url) ??
        getOptionalString(metadata.picture),
      role,
    }
  } catch {
    return null
  }
}

export function getRoleLabel(role: AppRole) {
  if (role === "admin") return "Administrateur"
  if (role === "guest") return "Invité"
  return "Organisateur"
}

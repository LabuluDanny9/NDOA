import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ApiError } from "@/lib/api/errors"

export async function requireApiContext() {
  if (!getOptionalSupabaseEnvironment()) throw ApiError.notConfigured()

  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch {
    throw ApiError.notConfigured()
  }

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) throw ApiError.unauthorized()
  return { supabase, claims: data.claims }
}

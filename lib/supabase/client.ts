import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseEnvironment } from "@/lib/supabase/env"
import type { Database } from "@/types/database.types"

export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnvironment()

  return createBrowserClient<Database>(url, publishableKey)
}

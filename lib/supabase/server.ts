import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseEnvironment } from "@/lib/supabase/env"
import type { Database } from "@/types/database.types"

export async function createServerSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnvironment()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Les Server Components ne peuvent pas écrire de cookies.
          // Le proxy rafraîchit la session avant leur rendu.
        }
      },
    },
  })
}

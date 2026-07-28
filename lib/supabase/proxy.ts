import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"
import type { Database } from "@/types/database.types"

export async function updateSupabaseSession(request: NextRequest) {
  const environment = getOptionalSupabaseEnvironment()
  let response = NextResponse.next({ request })

  if (!environment) {
    return response
  }

  const supabase = createServerClient<Database>(
    environment.url,
    environment.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })

          Object.entries(headers).forEach(([name, value]) => {
            response.headers.set(name, value)
          })
        },
      },
    }
  )

  await supabase.auth.getClaims()

  return response
}

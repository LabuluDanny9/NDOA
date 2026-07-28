import { NextResponse, type NextRequest } from "next/server"
import { getSafeRedirectPath } from "@/lib/auth/redirects"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    "/dashboard"
  )

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch {
      // La destination d'erreur reste volontairement générique.
    }
  }

  return NextResponse.redirect(
    new URL("/login?message=confirmation-failed", request.url)
  )
}

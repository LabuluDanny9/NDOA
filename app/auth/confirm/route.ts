import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { getSafeRedirectPath } from "@/lib/auth/redirects"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const emailOtpTypeSchema = z.enum([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
])

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")
  const typeResult = emailOtpTypeSchema.safeParse(
    request.nextUrl.searchParams.get("type")
  )
  const requestedNext = request.nextUrl.searchParams.get("next")

  if (tokenHash && typeResult.success) {
    try {
      const supabase = await createServerSupabaseClient()
      const type = typeResult.data as EmailOtpType
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      })

      if (!error) {
        const fallback =
          typeResult.data === "recovery" ? "/reset-password" : "/dashboard"
        const next = getSafeRedirectPath(requestedNext, fallback)
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

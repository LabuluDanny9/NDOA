import { NextResponse } from "next/server"
import { getProviderStatus } from "@/lib/integrations/providers"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"

export function GET() {
  const supabaseConfigured = Boolean(getOptionalSupabaseEnvironment())
  const ready = supabaseConfigured

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      checks: {
        app: true,
        supabaseConfigured,
        providers: getProviderStatus(),
      },
    },
    {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    }
  )
}

import { requireAdminApiContext } from "@/lib/api/context"
import { apiResponse, withApiErrors } from "@/lib/api/errors"
import { getProviderStatus } from "@/lib/integrations/providers"
import { getOptionalSupabaseEnvironment } from "@/lib/supabase/env"

export async function GET() {
  return withApiErrors(async (requestId) => {
    await requireAdminApiContext()
    return apiResponse({ environment: process.env.NODE_ENV, supabaseConfigured: Boolean(getOptionalSupabaseEnvironment()), providers: getProviderStatus() }, requestId)
  })
}

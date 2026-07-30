import { requireAdminApiContext } from "@/lib/api/context"
import { apiErrorFromSupabase, apiResponse, withApiErrors } from "@/lib/api/errors"

export async function GET() {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireAdminApiContext()
    const { data, error } = await supabase.from("activity_logs").select("*").order("occurred_at", { ascending: false }).limit(100)
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: data ?? [] }, requestId)
  })
}

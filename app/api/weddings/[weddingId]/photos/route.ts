import { randomUUID } from "node:crypto"
import { type NextRequest } from "next/server"
import { z } from "zod"
import { requireApiContext } from "@/lib/api/context"
import { ApiError, apiErrorFromSupabase, apiResponse, parseWithSchema, withApiErrors } from "@/lib/api/errors"
import { uuidSchema } from "@/lib/api/schemas"

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])
const maxBytes = 15 * 1024 * 1024
type RouteContext = { params: Promise<{ weddingId: string }> }

async function withSignedUrl(supabase: Awaited<ReturnType<typeof requireApiContext>>["supabase"], photo: Record<string, unknown>) {
  const path = String(photo.storage_path)
  const { data } = await supabase.storage.from("wedding-media").createSignedUrl(path, 3600)
  return { ...photo, url: data?.signedUrl ?? null }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const { data, error } = await supabase.from("photos").select("*").eq("wedding_id", weddingId).order("position", { ascending: true }).order("created_at", { ascending: true })
    if (error) throw apiErrorFromSupabase(error)
    return apiResponse({ items: await Promise.all((data ?? []).map((photo) => withSignedUrl(supabase, photo))) }, requestId)
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withApiErrors(async (requestId) => {
    const { supabase, claims } = await requireApiContext()
    const weddingId = parseWithSchema(uuidSchema, (await context.params).weddingId)
    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof File)) throw ApiError.badRequest("Aucun fichier image reçu.")
    if (file.size <= 0 || file.size > maxBytes) throw ApiError.badRequest("La photo doit peser entre 1 octet et 15 MiB.")
    if (!imageTypes.has(file.type)) throw ApiError.badRequest("Type d’image non autorisé.")
    const position = z.coerce.number().int().min(0).max(10_000).catch(0).parse(form.get("position") ?? 0)
    const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1]
    const storagePath = `${weddingId}/${randomUUID()}.${extension}`
    const upload = await supabase.storage.from("wedding-media").upload(storagePath, file, { contentType: file.type, upsert: false })
    if (upload.error) throw apiErrorFromSupabase(upload.error)
    const { data, error } = await supabase.from("photos").insert({
      wedding_id: weddingId,
      uploaded_by: claims.sub,
      storage_path: storagePath,
      original_filename: file.name.slice(0, 255),
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: typeof form.get("altText") === "string" ? String(form.get("altText")).slice(0, 500) : null,
      caption: typeof form.get("caption") === "string" ? String(form.get("caption")).slice(0, 1000) : null,
      position,
    }).select("*").single()
    if (error) {
      await supabase.storage.from("wedding-media").remove([storagePath])
      throw apiErrorFromSupabase(error)
    }
    return apiResponse(await withSignedUrl(supabase, data), requestId, { status: 201 })
  })
}

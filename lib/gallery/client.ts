export interface GalleryPhoto {
  id: string
  wedding_id: string
  storage_path: string
  original_filename: string | null
  mime_type: string
  size_bytes: number
  alt_text: string | null
  caption: string | null
  position: number
  created_at: string
  url: string | null
  source: "api" | "local"
}

export class GalleryClientError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number) {
    super(message)
    this.name = "GalleryClientError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const body = await response.json().catch(() => null) as { data?: T; error?: { code?: string; message?: string } } | null
  if (!response.ok || !body?.data) throw new GalleryClientError(body?.error?.message ?? "La requête galerie a échoué.", body?.error?.code ?? "REQUEST_FAILED", response.status)
  return body.data
}

export async function listPhotos(weddingId: string) {
  return request<{ items: GalleryPhoto[] }>(`/api/weddings/${encodeURIComponent(weddingId)}/photos`)
}

export async function uploadPhoto(
  weddingId: string,
  blob: Blob,
  originalName: string,
  position: number,
  options?: { publishOnInvitation?: boolean; caption?: string; altText?: string },
) {
  const form = new FormData()
  form.set("file", new File([blob], originalName.replace(/[^a-zA-Z0-9._-]/g, "_"), { type: blob.type || "image/webp" }))
  form.set("position", String(position))
  if (options?.publishOnInvitation) form.set("publishOnInvitation", "true")
  if (options?.caption) form.set("caption", options.caption)
  if (options?.altText) form.set("altText", options.altText)
  return request<GalleryPhoto>(`/api/weddings/${encodeURIComponent(weddingId)}/photos`, { method: "POST", body: form })
}

export async function updatePhoto(weddingId: string, photoId: string, update: { position?: number; altText?: string | null; caption?: string | null }) {
  return request<GalleryPhoto>(`/api/weddings/${encodeURIComponent(weddingId)}/photos/${encodeURIComponent(photoId)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(update) })
}

export async function deletePhoto(weddingId: string, photoId: string) {
  return request<{ id: string; deleted: boolean }>(`/api/weddings/${encodeURIComponent(weddingId)}/photos/${encodeURIComponent(photoId)}`, { method: "DELETE" })
}

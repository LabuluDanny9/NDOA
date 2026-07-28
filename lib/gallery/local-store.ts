import type { GalleryPhoto } from "@/lib/gallery/client"

const storageKey = (weddingId: string) => `ndoa:gallery:v1:${weddingId}`

export function readLocalPhotos(weddingId: string): GalleryPhoto[] {
  if (typeof window === "undefined") return []
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey(weddingId)) ?? "[]")
    return Array.isArray(value) ? value as GalleryPhoto[] : []
  } catch { return [] }
}

function write(weddingId: string, photos: GalleryPhoto[]) {
  window.localStorage.setItem(storageKey(weddingId), JSON.stringify(photos))
}

export function saveLocalPhoto(weddingId: string, photo: GalleryPhoto) {
  const current = readLocalPhotos(weddingId)
  write(weddingId, [...current.filter((item) => item.id !== photo.id), photo].map((item, index) => ({ ...item, position: index })))
  return photo
}

export function updateLocalPhoto(weddingId: string, photoId: string, update: Partial<Pick<GalleryPhoto, "position" | "alt_text" | "caption">>) {
  const current = readLocalPhotos(weddingId)
  const target = current.find((photo) => photo.id === photoId)
  if (!target) return null
  const updated = { ...target, ...update }
  const without = current.filter((photo) => photo.id !== photoId)
  without.splice(Math.max(0, Math.min(update.position ?? target.position, without.length)), 0, updated)
  write(weddingId, without.map((photo, index) => ({ ...photo, position: index })))
  return updated
}

export function deleteLocalPhoto(weddingId: string, photoId: string) {
  const current = readLocalPhotos(weddingId)
  write(weddingId, current.filter((photo) => photo.id !== photoId).map((photo, index) => ({ ...photo, position: index })))
}

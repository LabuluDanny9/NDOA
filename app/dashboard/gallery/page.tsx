"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ArrowDown, ArrowUp, Images, Loader2, Maximize2, Sparkles, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { deletePhoto, GalleryClientError, listPhotos, updatePhoto, uploadPhoto, type GalleryPhoto } from "@/lib/gallery/client"
import { compressImage } from "@/lib/gallery/image"
import { deleteLocalPhoto, readLocalPhotos, saveLocalPhoto, updateLocalPhoto } from "@/lib/gallery/local-store"
import { resolveActiveWedding } from "@/lib/weddings/active"

function localId() { return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) }

function blobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Lecture de l'image impossible."))
    reader.readAsDataURL(blob)
  })
}

export default function GalleryPage() {
  const { toast } = useToast()
  const [weddingId, setWeddingId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [source, setSource] = useState<"api" | "local">("local")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)

  const load = useCallback(async (target: string, preferredSource: "api" | "local" = "api") => {
    setLoading(true)
    if (preferredSource === "local") {
      setPhotos(readLocalPhotos(target))
      setSource("local")
      setLoading(false)
      return
    }
    try {
      const response = await listPhotos(target)
      setPhotos(response.items)
      setSource("api")
    } catch (error) {
      if (!(error instanceof GalleryClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") toast({ title: "Galerie indisponible", description: error instanceof GalleryClientError ? error.message : "Reessayez.", variant: "error" })
      setPhotos(readLocalPhotos(target))
      setSource("local")
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void resolveActiveWedding().then((active) => {
        const target = active.wedding?.id ?? null
        setWeddingId(target)
        setSource(active.source)
        if (target) void load(target, active.source)
        else {
          setPhotos([])
          setLoading(false)
        }
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) return
    if (!weddingId) {
      toast({ title: "Creez d'abord un mariage", description: "La galerie doit etre liee a un mariage reel.", variant: "error" })
      return
    }
    setUploading(true)
    try {
      for (const [index, file] of files.entries()) {
        const blob = await compressImage(file)
        if (source === "api") {
          await uploadPhoto(weddingId, blob, file.name, photos.length + index)
        } else {
          const now = new Date().toISOString()
          const dataUrl = await blobAsDataUrl(blob)
          saveLocalPhoto(weddingId, { id: `local-${localId()}`, wedding_id: weddingId, storage_path: dataUrl, original_filename: file.name, mime_type: blob.type || "image/webp", size_bytes: blob.size, alt_text: file.name, caption: null, position: photos.length + index, created_at: now, url: dataUrl, source: "local" })
        }
      }
      await load(weddingId)
      toast({ title: "Photos importees", description: `${files.length} image${files.length > 1 ? "s" : ""} ajoutee${files.length > 1 ? "s" : ""}.`, variant: "success" })
    } catch (error) {
      toast({ title: "Import impossible", description: error instanceof Error ? error.message : "Reessayez.", variant: "error" })
    } finally { setUploading(false) }
  }

  async function move(photo: GalleryPhoto, offset: number) {
    const targetPosition = photo.position + offset
    if (targetPosition < 0 || targetPosition >= photos.length) return
    try {
      if (!weddingId) return
      if (source === "api") await updatePhoto(weddingId, photo.id, { position: targetPosition })
      else updateLocalPhoto(weddingId, photo.id, { position: targetPosition })
      await load(weddingId)
    } catch (error) { toast({ title: "Reorganisation impossible", description: error instanceof GalleryClientError ? error.message : "Reessayez.", variant: "error" }) }
  }

  async function remove(photo: GalleryPhoto) {
    if (!window.confirm(`Supprimer ${photo.original_filename ?? "cette photo"} ?`)) return
    try {
      if (!weddingId) return
      if (source === "api") await deletePhoto(weddingId, photo.id)
      else deleteLocalPhoto(weddingId, photo.id)
      setPhotos((current) => current.filter((item) => item.id !== photo.id))
      setSelected(null)
      toast({ title: "Photo supprimee", variant: "success" })
    } catch (error) { toast({ title: "Suppression impossible", description: error instanceof GalleryClientError ? error.message : "Reessayez.", variant: "error" }) }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(14,165,233,0.84))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-amber-200">
              <Sparkles className="size-4" />
              Mediathèque
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">Galerie du mariage</h1>
            <p className="mt-3 text-sm leading-6 text-blue-50/92">Les images sont compressees dans le navigateur puis stockees dans le bucket prive du mariage, avec une presentation plus elegante et plus claire.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white/14 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/20">
            <Upload className="size-4" /> {uploading ? "Import en cours..." : "Ajouter des photos"}
            <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5"><p className="text-sm text-slate-500">Photos</p><p className="mt-3 text-3xl font-semibold text-slate-950">{photos.length}</p></div>
        <div className="surface-card p-5"><p className="text-sm text-slate-500">Source</p><p className="mt-3 text-xl font-semibold text-slate-950">{source === "api" ? "Supabase" : "Locale"}</p></div>
        <div className="surface-card p-5"><p className="text-sm text-slate-500">Compression</p><p className="mt-3 text-xl font-semibold text-slate-950">Activee</p></div>
      </section>

      {loading ? (
        <div className="surface-card flex items-center justify-center p-16 text-slate-500"><Loader2 className="mr-3 size-5 animate-spin" /> Chargement...</div>
      ) : photos.length === 0 ? (
        <div className="surface-card border border-dashed border-amber-300 p-16 text-center">
          <Images className="mx-auto size-10 text-amber-500" />
          <p className="mt-4 text-slate-600">Aucune photo pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <article key={photo.id} className="surface-card interactive-lift group overflow-hidden">
              <button type="button" className="relative block aspect-square w-full bg-slate-100" onClick={() => setSelected(photo)} aria-label={`Agrandir ${photo.original_filename ?? "la photo"}`}>
                {photo.url ? <Image src={photo.url} alt={photo.alt_text ?? photo.original_filename ?? "Photo du mariage"} fill unoptimized sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-slate-400">Apercu indisponible</div>}
                <span className="absolute right-3 top-3 rounded-full bg-white/85 p-2 text-slate-700"><Maximize2 className="size-4" /></span>
              </button>
              <div className="flex items-center justify-between gap-2 p-4">
                <p className="truncate text-xs text-slate-600">{photo.original_filename ?? "Photo"}</p>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon-xs" disabled={photo.position === 0} onClick={() => void move(photo, -1)} aria-label="Monter"><ArrowUp className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon-xs" disabled={photo.position === photos.length - 1} onClick={() => void move(photo, 1)} aria-label="Descendre"><ArrowDown className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => void remove(photo)} aria-label="Supprimer la photo"><Trash2 className="size-3.5 text-rose-500" /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6" role="dialog" aria-modal="true" aria-label="Apercu de la photo" onClick={() => setSelected(null)}>
          <div className="relative max-h-[90vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            {selected.url ? <Image src={selected.url} alt={selected.alt_text ?? "Photo du mariage"} width={1600} height={1200} unoptimized className="max-h-[82vh] max-w-full rounded-2xl object-contain" /> : null}
            <Button variant="secondary" size="icon" className="absolute -right-3 -top-3 rounded-full" onClick={() => setSelected(null)} aria-label="Fermer l'apercu"><X className="size-4" /></Button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

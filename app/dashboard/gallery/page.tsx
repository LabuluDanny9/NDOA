"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ArrowDown, ArrowUp, Images, Loader2, Maximize2, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { GalleryClientError, listPhotos, deletePhoto, updatePhoto, uploadPhoto, type GalleryPhoto } from "@/lib/gallery/client"
import { compressImage } from "@/lib/gallery/image"
import { deleteLocalPhoto, readLocalPhotos, saveLocalPhoto, updateLocalPhoto } from "@/lib/gallery/local-store"
import { readLocalWeddings } from "@/lib/weddings/local-store"

function localId() { return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) }

function blobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Lecture de l’image impossible."))
    reader.readAsDataURL(blob)
  })
}

export default function GalleryPage() {
  const { toast } = useToast()
  const [weddingId, setWeddingId] = useState("demo-wedding")
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [source, setSource] = useState<"api" | "local">("local")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)

  const load = useCallback(async (target: string) => {
    setLoading(true)
    try {
      const response = await listPhotos(target)
      setPhotos(response.items)
      setSource("api")
    } catch (error) {
      if (!(error instanceof GalleryClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") toast({ title: "Galerie indisponible", description: error instanceof GalleryClientError ? error.message : "Réessayez.", variant: "error" })
      setPhotos(readLocalPhotos(target))
      setSource("local")
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const target = readLocalWeddings()[0]?.id ?? "demo-wedding"
      setWeddingId(target)
      void load(target)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) return
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
      toast({ title: "Photos importées", description: `${files.length} image${files.length > 1 ? "s" : ""} ajoutée${files.length > 1 ? "s" : ""}.`, variant: "success" })
    } catch (error) {
      toast({ title: "Import impossible", description: error instanceof Error ? error.message : "Réessayez.", variant: "error" })
    } finally { setUploading(false) }
  }

  async function move(photo: GalleryPhoto, offset: number) {
    const targetPosition = photo.position + offset
    if (targetPosition < 0 || targetPosition >= photos.length) return
    try {
      if (source === "api") await updatePhoto(weddingId, photo.id, { position: targetPosition })
      else updateLocalPhoto(weddingId, photo.id, { position: targetPosition })
      await load(weddingId)
    } catch (error) { toast({ title: "Réorganisation impossible", description: error instanceof GalleryClientError ? error.message : "Réessayez.", variant: "error" }) }
  }

  async function remove(photo: GalleryPhoto) {
    if (!window.confirm(`Supprimer ${photo.original_filename ?? "cette photo"} ?`)) return
    try {
      if (source === "api") await deletePhoto(weddingId, photo.id)
      else deleteLocalPhoto(weddingId, photo.id)
      setPhotos((current) => current.filter((item) => item.id !== photo.id))
      setSelected(null)
      toast({ title: "Photo supprimée", variant: "success" })
    } catch (error) { toast({ title: "Suppression impossible", description: error instanceof GalleryClientError ? error.message : "Réessayez.", variant: "error" }) }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Médiathèque</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Galerie du mariage</h1><p className="mt-2 text-sm text-slate-600">Les images sont compressées dans le navigateur puis stockées dans le bucket privé du mariage.</p></div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600"><Upload className="size-4" /> {uploading ? "Import en cours…" : "Ajouter des photos"}<Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={handleUpload} disabled={uploading} /></label>
      </section>
      {loading ? <div className="flex items-center justify-center rounded-[2rem] bg-white p-16 text-slate-500"><Loader2 className="mr-3 size-5 animate-spin" /> Chargement…</div> : photos.length === 0 ? <div className="rounded-[2rem] border border-dashed border-amber-300 bg-white p-16 text-center"><Images className="mx-auto size-10 text-amber-500" /><p className="mt-4 text-slate-600">Aucune photo pour le moment.</p></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{photos.map((photo) => <article key={photo.id} className="group overflow-hidden rounded-[1.5rem] bg-white shadow-sm"><button type="button" className="relative block aspect-square w-full bg-slate-100" onClick={() => setSelected(photo)} aria-label={`Agrandir ${photo.original_filename ?? "la photo"}`}>{photo.url ? <Image src={photo.url} alt={photo.alt_text ?? photo.original_filename ?? "Photo du mariage"} fill unoptimized sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-slate-400">Aperçu indisponible</div>}<span className="absolute right-3 top-3 rounded-full bg-white/85 p-2 text-slate-700"><Maximize2 className="size-4" /></span></button><div className="flex items-center justify-between gap-2 p-3"><p className="truncate text-xs text-slate-600">{photo.original_filename ?? "Photo"}</p><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon-xs" disabled={photo.position === 0} onClick={() => void move(photo, -1)} aria-label="Déplacer vers la gauche"><ArrowUp className="size-3.5" /></Button><Button variant="ghost" size="icon-xs" disabled={photo.position === photos.length - 1} onClick={() => void move(photo, 1)} aria-label="Déplacer vers la droite"><ArrowDown className="size-3.5" /></Button><Button variant="ghost" size="icon-xs" onClick={() => void remove(photo)} aria-label="Supprimer la photo"><Trash2 className="size-3.5 text-rose-500" /></Button></div></div></article>)}</div>}
      {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6" role="dialog" aria-modal="true" aria-label="Aperçu de la photo" onClick={() => setSelected(null)}><div className="relative max-h-[90vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>{selected.url ? <Image src={selected.url} alt={selected.alt_text ?? "Photo du mariage"} width={1600} height={1200} unoptimized className="max-h-[82vh] max-w-full rounded-2xl object-contain" /> : null}<Button variant="secondary" size="icon" className="absolute -right-3 -top-3 rounded-full" onClick={() => setSelected(null)} aria-label="Fermer l’aperçu"><X className="size-4" /></Button></div></div> : null}
    </main>
  )
}

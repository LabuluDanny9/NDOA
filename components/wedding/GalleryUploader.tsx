"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  type Control,
  type FieldErrors,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImagePlus } from "lucide-react"
import {
  MAX_GALLERY_PHOTOS,
  type WeddingFormValues,
} from "@/components/wedding/wedding-form-schema"

interface GalleryUploaderProps {
  control: Control<WeddingFormValues>
  errors: FieldErrors<WeddingFormValues>
  setValue: UseFormSetValue<WeddingFormValues>
}

export default function GalleryUploader({
  control,
  errors,
  setValue,
}: GalleryUploaderProps) {
  const coverPhoto = useWatch({ control, name: "coverPhoto" })
  const galleryPhotos = useWatch({ control, name: "galleryPhotos" })
  const [dragActive, setDragActive] = useState(false)

  const previews = useMemo(
    () =>
      galleryPhotos.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [galleryPhotos]
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  const handleCoverPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setValue("coverPhoto", file, { shouldValidate: true, shouldDirty: true })
  }

  const appendGalleryImages = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"))
    setValue(
      "galleryPhotos",
      [...galleryPhotos, ...images].slice(0, MAX_GALLERY_PHOTOS),
      { shouldValidate: true, shouldDirty: true }
    )
  }

  const handleGalleryPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    appendGalleryImages(Array.from(event.target.files ?? []))
    event.target.value = ""
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    appendGalleryImages(Array.from(event.dataTransfer.files ?? []))
  }

  const removeGalleryImage = (index: number) => {
    const nextImages = galleryPhotos.filter((_, itemIndex) => itemIndex !== index)
    setValue("galleryPhotos", nextImages, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
    >
      <Card className="rounded-[2rem] border-none bg-transparent shadow-none">
        <CardHeader className="space-y-4 rounded-t-[2rem] bg-slate-50 px-8 py-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-semibold text-slate-900">Photos</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
              Ajoutez une photo de couverture et une galerie de photos du couple.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 py-8">
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-900">Photo de couverture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleCoverPick}
              aria-invalid={Boolean(errors.coverPhoto)}
            />
            {errors.coverPhoto?.message ? (
              <p role="alert" className="text-sm text-rose-600">
                {errors.coverPhoto.message}
              </p>
            ) : null}
            {coverPhoto ? (
              <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">Fichier sélectionné : {coverPhoto.name}</p>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <ImagePlus className="size-5 text-amber-600" />
              <p className="text-sm font-semibold text-slate-900">Galerie du couple</p>
            </div>
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`mt-4 rounded-3xl border-2 border-dashed p-6 text-center transition ${
                dragActive ? "border-amber-400 bg-amber-50/50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="text-sm text-slate-600">Glissez-déposez vos images ici ou utilisez le bouton ci-dessous.</p>
              <p className="mt-2 text-xs text-slate-500">
                Maximum {MAX_GALLERY_PHOTOS} images, 8 Mo par fichier.
              </p>
              <label className="mt-4 inline-flex cursor-pointer rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600">
                Ajouter des photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryPick}
                />
              </label>
            </div>
            {errors.galleryPhotos?.message ? (
              <p role="alert" className="mt-3 text-sm text-rose-600">
                {errors.galleryPhotos.message}
              </p>
            ) : null}
            {galleryPhotos.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {previews.map((preview, index) => (
                  <div key={preview.url} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative h-40 w-full">
                      <Image
                        src={preview.url}
                        alt={preview.file.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      aria-label={`Supprimer ${preview.file.name}`}
                      className="absolute right-3 top-3 inline-flex rounded-full bg-white/80 p-2 text-slate-700 transition hover:bg-white"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Aucune image ajoutée pour le moment.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const MAX_GALLERY_UPLOAD_BYTES = 15 * 1024 * 1024

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Sélectionnez uniquement des images.")
  if (file.size > MAX_GALLERY_UPLOAD_BYTES) throw new Error("Chaque image doit peser au maximum 15 MiB.")
  const bitmap = await createImageBitmap(file)
  const maxDimension = 2400
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("La compression d’image n’est pas disponible.")
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Compression impossible.")), "image/webp", 0.84)
  })
}

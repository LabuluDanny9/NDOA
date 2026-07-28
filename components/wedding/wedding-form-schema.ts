import type { FieldPath } from "react-hook-form"
import { z } from "zod"

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024
export const MAX_GALLERY_PHOTOS = 20

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File
}

const imageFileSchema = z
  .custom<File>(isFile, "Le fichier sélectionné est invalide")
  .refine((file) => file.type.startsWith("image/"), "Le fichier doit être une image")
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE,
    "Chaque image doit peser au maximum 8 Mo"
  )

export const programItemSchema = z.object({
  eventName: z.string().trim().min(2, "Nom requis"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  location: z.string().trim().min(2, "Lieu requis"),
  description: z.string().trim().min(5, "Description requise"),
})

const colorSchema = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, "Utilisez une couleur hexadécimale valide")

export const weddingFormSchema = z.object({
  weddingName: z.string().trim().min(3, "Nom du mariage requis"),
  groomName: z.string().trim().min(2, "Nom du marié requis"),
  brideName: z.string().trim().min(2, "Nom de la mariée requis"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  slogan: z.string().trim().max(120, "Maximum 120 caractères"),
  venueName: z.string().trim().min(2, "Nom de la salle requis"),
  address: z.string().trim().min(5, "Adresse requise"),
  city: z.string().trim().min(2, "Ville requise"),
  province: z.string().trim().min(2, "Province requise"),
  country: z.string().trim().min(2, "Pays requis"),
  gpsCoordinates: z.string().trim(),
  mapsLink: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().url().safeParse(value).success,
      "Lien Google Maps invalide"
    ),
  coverPhoto: imageFileSchema
    .nullable()
    .refine((file): boolean => file !== null, "Photo de couverture requise"),
  galleryPhotos: z
    .array(imageFileSchema)
    .max(
      MAX_GALLERY_PHOTOS,
      `La galerie accepte au maximum ${MAX_GALLERY_PHOTOS} photos`
    ),
  story: z
    .string()
    .trim()
    .min(20, "Racontez votre histoire en quelques mots")
    .max(5000, "Maximum 5000 caractères"),
  programs: z
    .array(programItemSchema)
    .min(1, "Ajoutez au moins une cérémonie")
    .max(10, "Le programme accepte au maximum 10 cérémonies"),
  rsvpDeadline: z.string().min(1, "Date limite requise"),
  maxGuests: z
    .number({ invalid_type_error: "Saisissez un nombre valide" })
    .int("Le nombre doit être entier")
    .min(1, "Au moins un accompagnant")
    .max(20, "Maximum 20 accompagnants"),
  allowChildren: z.boolean(),
  allowComments: z.boolean(),
  confirmationMessage: z
    .string()
    .trim()
    .min(10, "Message de confirmation requis")
    .max(500, "Maximum 500 caractères"),
  primaryColor: colorSchema,
  secondaryColor: colorSchema,
  textColor: colorSchema,
  font: z.string().trim().min(2, "Police requise"),
  style: z.string().trim().min(2, "Style requis"),
})

export type WeddingFormValues = z.infer<typeof weddingFormSchema>

export const defaultWeddingValues: WeddingFormValues = {
  weddingName: "",
  groomName: "",
  brideName: "",
  date: "",
  time: "",
  slogan: "",
  venueName: "",
  address: "",
  city: "",
  province: "",
  country: "",
  gpsCoordinates: "",
  mapsLink: "",
  coverPhoto: null,
  galleryPhotos: [],
  story: "",
  programs: [
    {
      eventName: "Cérémonie",
      date: "",
      time: "",
      location: "",
      description: "",
    },
  ],
  rsvpDeadline: "",
  maxGuests: 1,
  allowChildren: false,
  allowComments: false,
  confirmationMessage: "",
  primaryColor: "#f59e0b",
  secondaryColor: "#0f172a",
  textColor: "#0f172a",
  font: "Inter",
  style: "Classic",
}

export const stepValidationMap: Record<
  number,
  FieldPath<WeddingFormValues>[]
> = {
  0: ["weddingName", "groomName", "brideName", "date", "time", "slogan"],
  1: [
    "venueName",
    "address",
    "city",
    "province",
    "country",
    "gpsCoordinates",
    "mapsLink",
  ],
  2: ["coverPhoto", "galleryPhotos"],
  3: ["story"],
  4: ["programs"],
  5: [
    "rsvpDeadline",
    "maxGuests",
    "allowChildren",
    "allowComments",
    "confirmationMessage",
  ],
  6: ["primaryColor", "secondaryColor", "textColor", "font", "style"],
}

import { z } from "zod"

const uuid = z.string().uuid("Identifiant invalide.")
const shortText = (max: number) => z.string().trim().min(1).max(max)

export const weddingCreateSchema = z.object({
  name: shortText(120), slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  partnerOneName: shortText(100), partnerTwoName: shortText(100),
  weddingDate: z.string().date().optional().nullable(),
  ceremonyTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  timezone: z.string().trim().min(1).max(80).default("Africa/Lubumbashi"),
  description: z.string().trim().max(5000).optional().nullable(),
  theme: z.record(z.string(), z.unknown()).default({}), settings: z.record(z.string(), z.unknown()).default({}),
})

export const weddingUpdateSchema = weddingCreateSchema.partial().extend({ status: z.enum(["draft", "published", "archived"]).optional() })

const eventBaseSchema = z.object({
  type: z.enum(["ceremony", "reception", "rehearsal", "civil", "religious", "other"]).default("other"),
  title: shortText(120), description: z.string().trim().max(5000).optional().nullable(),
  startsAt: z.string().datetime({ offset: true }), endsAt: z.string().datetime({ offset: true }).optional().nullable(),
  venueName: z.string().trim().max(160).optional().nullable(), address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(), country: z.string().trim().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(), longitude: z.number().min(-180).max(180).optional().nullable(),
  mapsUrl: z.string().url().max(1000).optional().nullable(), position: z.number().int().min(0).max(10_000).default(0), isPublic: z.boolean().default(true),
})

export const eventCreateSchema = eventBaseSchema.superRefine((value, context) => {
  if (value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "La fin doit suivre le début." })
})
export const eventUpdateSchema = eventBaseSchema.partial().superRefine((value, context) => {
  if (value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "La fin doit suivre le début." })
})

const programBaseSchema = z.object({
  eventId: uuid.optional().nullable(), title: shortText(120), description: z.string().trim().max(5000).optional().nullable(),
  scheduledAt: z.string().datetime({ offset: true }), durationMinutes: z.number().int().positive().max(1440).optional().nullable(),
  location: z.string().trim().max(160).optional().nullable(), position: z.number().int().min(0).max(10_000).default(0), isPublic: z.boolean().default(true),
})
export const programCreateSchema = programBaseSchema
export const programUpdateSchema = programBaseSchema.partial()

export const guestCreateSchema = z.object({
  groupId: uuid.optional().nullable(), tableId: uuid.optional().nullable(), firstName: shortText(100), lastName: shortText(100),
  middleName: z.string().trim().max(100).optional().nullable(), email: z.string().email().max(254).optional().nullable(), phone: z.string().trim().max(32).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(), category: z.string().trim().max(80).optional().nullable(), language: z.string().trim().min(2).max(10).default("fr"),
  allowedCompanions: z.number().int().min(0).max(20).default(0), notes: z.string().trim().max(5000).optional().nullable(), tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
})
export const guestUpdateSchema = guestCreateSchema.partial().extend({ rsvpStatus: z.enum(["pending", "accepted", "declined", "maybe"]).optional(), invitationStatus: z.enum(["draft", "queued", "sent", "delivered", "opened", "failed"]).optional() })
export const guestGroupSchema = z.object({ name: shortText(80), description: z.string().trim().max(1000).optional().nullable(), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(), position: z.number().int().min(0).max(10_000).default(0) })
export const guestTableSchema = z.object({ name: shortText(80), capacity: z.number().int().positive().max(100), shape: z.string().trim().max(40).optional().nullable(), location: z.string().trim().max(160).optional().nullable(), position: z.number().int().min(0).max(10_000).default(0) })
export const messageCreateSchema = z.object({
  guestId: uuid.optional().nullable(),
  channel: z.enum(["email", "sms", "whatsapp", "in_app"]),
  recipient: shortText(254),
  subject: z.string().trim().max(160).optional().nullable(),
  body: z.string().trim().max(10000).optional(),
  template: z.enum(["invitation", "reminder", "rsvp_confirmation"]).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
}).superRefine((value, context) => {
  if (!value.body && !value.template) context.addIssue({ code: z.ZodIssueCode.custom, path: ["body"], message: "Un message ou un template est requis." })
})
export const adminUserUpdateSchema = z.object({
  status: z.enum(["active", "suspended", "disabled"]).optional(),
  role: z.enum(["admin", "organizer", "guest"]).optional(),
}).refine((value) => value.status !== undefined || value.role !== undefined, { message: "Une modification est requise." })
export const uuidSchema = uuid

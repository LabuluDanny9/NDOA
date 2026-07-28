import {
  defaultWeddingValues,
  type WeddingFormValues,
} from "@/components/wedding/wedding-form-schema"

export type WeddingStatus = "draft" | "published" | "archived"

export interface WeddingSummary {
  id: string
  name: string
  slug: string
  partnerOneName: string
  partnerTwoName: string
  weddingDate: string | null
  status: WeddingStatus
  description: string | null
  timezone: string
  createdAt: string
  updatedAt: string
  source: "api" | "local"
}

export type SerializableWeddingValues = Omit<WeddingFormValues, "coverPhoto" | "galleryPhotos"> & {
  coverPhoto: null
  galleryPhotos: []
}

export interface LocalWedding extends WeddingSummary {
  source: "local"
  formValues: SerializableWeddingValues
}

export interface WeddingApiRow {
  id: string
  name: string
  slug: string
  partner_one_name: string
  partner_two_name: string
  wedding_date: string | null
  status: WeddingStatus
  description: string | null
  timezone: string
  created_at: string
  updated_at: string
  theme?: Record<string, unknown> | null
  settings?: Record<string, unknown> | null
}

export class WeddingClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = "WeddingClientError"
  }
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
}

export function weddingSlug(values: Pick<WeddingFormValues, "weddingName" | "groomName" | "brideName">) {
  const base = slugify(values.weddingName) || slugify(`${values.groomName}-${values.brideName}`)
  return base || "mon-mariage"
}

export function toWeddingApiPayload(values: WeddingFormValues) {
  return {
    name: values.weddingName,
    slug: weddingSlug(values),
    partnerOneName: values.groomName,
    partnerTwoName: values.brideName,
    weddingDate: values.date || null,
    ceremonyTime: values.time || null,
    timezone: "Africa/Lubumbashi",
    description: values.story || null,
    theme: {
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor,
      textColor: values.textColor,
      font: values.font,
      style: values.style,
    },
    settings: {
      slogan: values.slogan,
      venueName: values.venueName,
      address: values.address,
      city: values.city,
      province: values.province,
      country: values.country,
      gpsCoordinates: values.gpsCoordinates,
      mapsLink: values.mapsLink,
      rsvpDeadline: values.rsvpDeadline,
      maxGuests: values.maxGuests,
      allowChildren: values.allowChildren,
      allowComments: values.allowComments,
      confirmationMessage: values.confirmationMessage,
      programs: values.programs,
    },
  }
}

export function toSerializableWeddingValues(values: WeddingFormValues): SerializableWeddingValues {
  return { ...values, coverPhoto: null, galleryPhotos: [] }
}

export function fromWeddingApiRow(row: WeddingApiRow): WeddingSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    partnerOneName: row.partner_one_name,
    partnerTwoName: row.partner_two_name,
    weddingDate: row.wedding_date,
    status: row.status,
    description: row.description,
    timezone: row.timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: "api",
  }
}

export function formValuesFromWeddingApi(row: WeddingApiRow): WeddingFormValues {
  const theme = row.theme ?? {}
  const settings = row.settings ?? {}
  const values: WeddingFormValues = {
    ...defaultWeddingValues,
    weddingName: row.name,
    groomName: row.partner_one_name,
    brideName: row.partner_two_name,
    date: row.wedding_date ?? "",
    story: row.description ?? "",
    primaryColor: typeof theme.primaryColor === "string" ? theme.primaryColor : defaultWeddingValues.primaryColor,
    secondaryColor: typeof theme.secondaryColor === "string" ? theme.secondaryColor : defaultWeddingValues.secondaryColor,
    textColor: typeof theme.textColor === "string" ? theme.textColor : defaultWeddingValues.textColor,
    font: typeof theme.font === "string" ? theme.font : defaultWeddingValues.font,
    style: typeof theme.style === "string" ? theme.style : defaultWeddingValues.style,
  }
  const stringFields = ["slogan", "venueName", "address", "city", "province", "country", "gpsCoordinates", "mapsLink", "rsvpDeadline", "confirmationMessage"] as const
  for (const field of stringFields) {
    if (typeof settings[field] === "string") values[field] = settings[field]
  }
  if (typeof settings.maxGuests === "number") values.maxGuests = settings.maxGuests
  if (typeof settings.allowChildren === "boolean") values.allowChildren = settings.allowChildren
  if (typeof settings.allowComments === "boolean") values.allowComments = settings.allowComments
  if (Array.isArray(settings.programs)) values.programs = settings.programs as WeddingFormValues["programs"]
  return values
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  })
  let body: { data?: T; error?: { code?: string; message?: string; details?: unknown } }
  try {
    body = await response.json()
  } catch {
    throw new WeddingClientError("Réponse serveur invalide.", "INVALID_RESPONSE", response.status)
  }
  if (!response.ok || !body.data) {
    throw new WeddingClientError(
      body.error?.message ?? "La requête n’a pas abouti.",
      body.error?.code ?? "REQUEST_FAILED",
      response.status,
      body.error?.details,
    )
  }
  return body.data
}

export async function createWedding(values: WeddingFormValues) {
  return request<WeddingApiRow>("/api/weddings", { method: "POST", body: JSON.stringify(toWeddingApiPayload(values)) })
}

export async function updateWedding(weddingId: string, values: WeddingFormValues) {
  return request<WeddingApiRow>(`/api/weddings/${encodeURIComponent(weddingId)}`, { method: "PATCH", body: JSON.stringify(toWeddingApiPayload(values)) })
}

export async function getWedding(weddingId: string) {
  return request<WeddingApiRow>(`/api/weddings/${encodeURIComponent(weddingId)}`)
}

export async function listWeddings() {
  return request<{ items: WeddingApiRow[] }>("/api/weddings?pageSize=100")
}

export async function setWeddingStatus(weddingId: string, status: Exclude<WeddingStatus, "archived">) {
  return request<WeddingApiRow>(`/api/weddings/${encodeURIComponent(weddingId)}`, { method: "PATCH", body: JSON.stringify({ status }) })
}

export async function deleteWedding(weddingId: string) {
  return request<{ id: string; deleted: boolean }>(`/api/weddings/${encodeURIComponent(weddingId)}`, { method: "DELETE" })
}

import { defaultWeddingValues, type WeddingFormValues } from "@/components/wedding/wedding-form-schema"
import { type LocalWedding, type WeddingSummary, toSerializableWeddingValues } from "@/lib/weddings/client"

const STORAGE_KEY = "ndoa:weddings:v1"

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function isLocalWedding(value: unknown): value is LocalWedding {
  return Boolean(value && typeof value === "object" && "id" in value && "formValues" in value)
}

export function readLocalWeddings(): LocalWedding[] {
  if (typeof window === "undefined") return []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter(isLocalWedding) : []
  } catch {
    return []
  }
}

function writeLocalWeddings(weddings: LocalWedding[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(weddings))
}

export function localFormValues(wedding: LocalWedding): WeddingFormValues {
  return { ...defaultWeddingValues, ...wedding.formValues, coverPhoto: null, galleryPhotos: [] }
}

export function createLocalWedding(values: WeddingFormValues): LocalWedding {
  const now = new Date().toISOString()
  const id = createId()
  const slugBase = values.weddingName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "mon-mariage"
  const wedding: LocalWedding = {
    id,
    name: values.weddingName,
    slug: `${slugBase}-${id.slice(0, 8)}`,
    partnerOneName: values.groomName,
    partnerTwoName: values.brideName,
    weddingDate: values.date || null,
    status: "draft",
    description: values.story || null,
    timezone: "Africa/Lubumbashi",
    createdAt: now,
    updatedAt: now,
    source: "local",
    formValues: toSerializableWeddingValues(values),
  }
  writeLocalWeddings([wedding, ...readLocalWeddings()])
  return wedding
}

export function updateLocalWedding(id: string, values: WeddingFormValues) {
  const now = new Date().toISOString()
  const updated = readLocalWeddings().map((wedding) => wedding.id === id
    ? { ...wedding, name: values.weddingName, partnerOneName: values.groomName, partnerTwoName: values.brideName, weddingDate: values.date || null, description: values.story || null, updatedAt: now, formValues: toSerializableWeddingValues(values) }
    : wedding)
  writeLocalWeddings(updated)
  return updated.find((wedding) => wedding.id === id) ?? null
}

export function duplicateLocalWedding(id: string) {
  const source = readLocalWeddings().find((wedding) => wedding.id === id)
  if (!source) return null
  const values = localFormValues(source)
  values.weddingName = `${values.weddingName} (copie)`
  return createLocalWedding(values)
}

export function setLocalWeddingStatus(id: string, status: Exclude<LocalWedding["status"], "archived">) {
  const updated = readLocalWeddings().map((wedding) => wedding.id === id ? { ...wedding, status, updatedAt: new Date().toISOString() } : wedding)
  writeLocalWeddings(updated)
  return updated.find((wedding) => wedding.id === id) ?? null
}

export function deleteLocalWedding(id: string) {
  const current = readLocalWeddings()
  const remaining = current.filter((wedding) => wedding.id !== id)
  writeLocalWeddings(remaining)
  return remaining.length !== current.length
}

export function asSummary(wedding: LocalWedding): WeddingSummary {
  return wedding
}

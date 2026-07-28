import type { Guest, RSVPStatus } from "@/components/guests/types"

export const MAX_CSV_FILE_SIZE = 2 * 1024 * 1024
export const MAX_CSV_GUESTS = 1000

const CSV_COLUMNS = [
  "lastName",
  "firstName",
  "phone",
  "email",
  "city",
  "category",
  "tableNumber",
  "rsvpStatus",
] as const

const RSVP_STATUSES = new Set<RSVPStatus>([
  "present",
  "absent",
  "pending",
  "maybe",
])

export function parseCsvRows(source: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (index === 0 && character === "\uFEFF") {
      continue
    }

    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        cell += character
      }
      continue
    }

    if (character === '"' && cell.length === 0) {
      quoted = true
    } else if (character === ",") {
      row.push(cell)
      cell = ""
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") {
        index += 1
      }
      row.push(cell)
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row)
      }
      row = []
      cell = ""
    } else {
      cell += character
    }
  }

  if (quoted) {
    throw new Error("Le fichier CSV contient une cellule non terminée.")
  }

  row.push(cell)
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row)
  }

  return rows
}

export function neutralizeSpreadsheetFormula(value: string): string {
  return /^[\s\u0000-\u001f]*[=+\-@]/u.test(value) ? `'${value}` : value
}

function encodeCsvCell(value: unknown): string {
  const safeValue = neutralizeSpreadsheetFormula(String(value ?? ""))
  return `"${safeValue.replaceAll('"', '""')}"`
}

export function createGuestCsv(guests: Guest[]): string {
  const rows = [
    CSV_COLUMNS.map(encodeCsvCell).join(","),
    ...guests.map((guest) =>
      CSV_COLUMNS.map((column) => encodeCsvCell(guest[column])).join(",")
    ),
  ]

  return `\uFEFF${rows.join("\r\n")}`
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/u, "").trim().toLowerCase()
}

function restoreNeutralizedCell(value: string): string {
  return /^'[\s\u0000-\u001f]*[=+\-@]/u.test(value)
    ? value.slice(1)
    : value
}

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

function parseRsvpStatus(value: string): RSVPStatus {
  const normalized = value.trim().toLowerCase() as RSVPStatus
  return RSVP_STATUSES.has(normalized) ? normalized : "pending"
}

export function parseGuestCsv(source: string): Guest[] {
  const rows = parseCsvRows(source)
  if (rows.length === 0) {
    throw new Error("Le fichier CSV est vide.")
  }

  const normalizedHeader = rows[0].map(normalizeHeader)
  const columnIndexes = new Map<string, number>(
    normalizedHeader.map((column, index) => [column, index])
  )

  if (!columnIndexes.has("lastname") || !columnIndexes.has("firstname")) {
    throw new Error(
      "Le CSV doit contenir les colonnes lastName et firstName."
    )
  }

  const dataRows = rows.slice(1)
  if (dataRows.length > MAX_CSV_GUESTS) {
    throw new Error(
      `Un import est limité à ${MAX_CSV_GUESTS} invités à la fois.`
    )
  }

  const getCell = (row: string[], column: string) => {
    const index = columnIndexes.get(column.toLowerCase())
    return index === undefined
      ? ""
      : restoreNeutralizedCell((row[index] ?? "").trim())
  }

  const timestamp = new Date().toISOString()

  return dataRows.map((row, index) => {
    const lastName = getCell(row, "lastName")
    const firstName = getCell(row, "firstName")

    if (!lastName || !firstName) {
      throw new Error(
        `La ligne ${index + 2} doit contenir un nom et un prénom.`
      )
    }

    return {
      id: `import-${Date.now().toString(36)}-${index}`,
      lastName,
      firstName,
      phone: getCell(row, "phone") || undefined,
      email: getCell(row, "email") || undefined,
      city: getCell(row, "city") || undefined,
      category: getCell(row, "category") || undefined,
      tableNumber: parseOptionalNumber(getCell(row, "tableNumber")),
      guestsCount: 0,
      rsvpStatus: parseRsvpStatus(getCell(row, "rsvpStatus")),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  })
}

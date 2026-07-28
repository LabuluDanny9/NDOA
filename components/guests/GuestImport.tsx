"use client"

import { useRef, useState } from "react"
import { FileSpreadsheet, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_CSV_FILE_SIZE, parseGuestCsv } from "@/components/guests/guest-csv"
import type { Guest } from "@/components/guests/types"

interface GuestImportProps { onImport: (guests: Guest[]) => void }

export default function GuestImport({ onImport }: GuestImportProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isReading, setIsReading] = useState(false)

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFeedback(null)
    const extension = file.name.toLowerCase().split(".").pop()
    if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
      setFeedback("Sélectionnez un fichier CSV ou Excel.")
      event.target.value = ""
      return
    }
    if (file.size > MAX_CSV_FILE_SIZE) {
      setFeedback("Le fichier dépasse la limite de 2 Mo.")
      event.target.value = ""
      return
    }
    setIsReading(true)
    try {
      const guests = extension === "csv" ? parseGuestCsv(await file.text()) : await parseExcel(file)
      onImport(guests)
      setFeedback(`${guests.length} invité${guests.length > 1 ? "s" : ""} importé${guests.length > 1 ? "s" : ""}.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Impossible de lire ce fichier.")
    } finally {
      setIsReading(false)
      event.target.value = ""
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFile} className="sr-only" aria-label="Importer des invités depuis un fichier CSV ou Excel" />
      <Button type="button" variant="outline" disabled={isReading} onClick={() => fileRef.current?.click()}>
        {isReading ? <Upload className="mr-2 h-4 w-4" aria-hidden="true" /> : <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />}
        {isReading ? "Import en cours…" : "Importer CSV / Excel"}
      </Button>
      {feedback ? <p className="mt-2 max-w-64 text-xs text-slate-600" role="status">{feedback}</p> : null}
    </div>
  )
}

async function parseExcel(file: File): Promise<Guest[]> {
  const XLSX = await import("xlsx")
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error("Le classeur Excel ne contient aucune feuille.")
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  if (rows.length > 1000) throw new Error("L’import est limité à 1 000 invités.")
  return rows.map((row, index) => {
    const value = (name: string) => String(row[name] ?? row[name.toLowerCase()] ?? "").trim()
    const lastName = value("lastName") || value("Nom")
    const firstName = value("firstName") || value("Prénom")
    if (!lastName || !firstName) throw new Error(`Ligne ${index + 2} : les colonnes lastName et firstName sont requises.`)
    const now = new Date().toISOString()
    return {
      id: `import-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}`}`,
      lastName,
      firstName,
      middleName: value("middleName") || undefined,
      email: value("email") || undefined,
      phone: value("phone") || undefined,
      city: value("city") || undefined,
      category: value("category") || undefined,
      tableNumber: Number(value("tableNumber")) || null,
      guestsCount: Number(value("guestsCount")) || 0,
      rsvpStatus: (value("rsvpStatus") || "pending") as Guest["rsvpStatus"],
      createdAt: now,
      updatedAt: now,
    } satisfies Guest
  })
}

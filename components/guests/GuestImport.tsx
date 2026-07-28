"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import {
  MAX_CSV_FILE_SIZE,
  parseGuestCsv,
} from "@/components/guests/guest-csv"
import type { Guest } from "@/components/guests/types"

interface GuestImportProps {
  onImport: (guests: Guest[]) => void
}

export default function GuestImport({ onImport }: GuestImportProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isReading, setIsReading] = useState(false)

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setFeedback(null)

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFeedback("Sélectionnez un fichier CSV.")
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
      const guests = parseGuestCsv(await file.text())
      onImport(guests)
      setFeedback(
        `${guests.length} invité${guests.length > 1 ? "s" : ""} importé${guests.length > 1 ? "s" : ""}.`
      )
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Impossible de lire ce CSV."
      )
    } finally {
      setIsReading(false)
      event.target.value = ""
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onFile}
        className="sr-only"
        aria-label="Importer des invités depuis un fichier CSV"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isReading}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
        {isReading ? "Import en cours…" : "Importer CSV"}
      </Button>
      {feedback ? (
        <p className="mt-2 max-w-64 text-xs text-slate-600" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  )
}

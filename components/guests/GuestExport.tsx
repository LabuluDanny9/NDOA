"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { createGuestCsv } from "@/components/guests/guest-csv"
import type { Guest } from "@/components/guests/types"

export default function GuestExport({ guests }: { guests: Guest[] }) {
  function downloadCsv() {
    const blob = new Blob([createGuestCsv(guests)], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ndoa-invites-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={downloadCsv}
      disabled={guests.length === 0}
    >
      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
      Exporter CSV
    </Button>
  )
}

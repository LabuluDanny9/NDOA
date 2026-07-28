"use client"

import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
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

  async function downloadExcel() {
    const XLSX = await import("xlsx")
    const rows = guests.map((guest) => ({
      lastName: guest.lastName,
      firstName: guest.firstName,
      middleName: guest.middleName ?? "",
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      city: guest.city ?? "",
      category: guest.category ?? "",
      tableNumber: guest.tableNumber ?? "",
      guestsCount: guest.guestsCount ?? 0,
      rsvpStatus: guest.rsvpStatus ?? "pending",
    }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Invités")
    XLSX.writeFile(workbook, `ndoa-invites-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf")
    const document = new jsPDF({ orientation: "landscape" })
    document.setFontSize(16)
    document.text("Liste des invités NDOA", 14, 16)
    document.setFontSize(9)
    document.text(`Export du ${new Date().toLocaleDateString("fr-FR")}`, 14, 23)
    const headers = ["Nom", "Prénom", "Email", "Téléphone", "Catégorie", "RSVP"]
    const columns = [14, 52, 92, 145, 195, 240]
    headers.forEach((header, index) => document.text(header, columns[index], 34))
    guests.slice(0, 40).forEach((guest, rowIndex) => {
      const y = 42 + rowIndex * 6
      ;[guest.lastName, guest.firstName, guest.email ?? "-", guest.phone ?? "-", guest.category ?? "-", guest.rsvpStatus ?? "pending"].forEach((value, index) => document.text(String(value).slice(0, 24), columns[index], y))
    })
    document.save(`ndoa-invites-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
      type="button"
      variant="outline"
      onClick={downloadCsv}
      disabled={guests.length === 0}
      >
      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
      Exporter CSV
      </Button>
      <Button type="button" variant="outline" onClick={() => void downloadExcel()} disabled={guests.length === 0}>
        <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
        Exporter Excel
      </Button>
      <Button type="button" variant="outline" onClick={() => void downloadPdf()} disabled={guests.length === 0}>
        <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
        Exporter PDF
      </Button>
    </div>
  )
}

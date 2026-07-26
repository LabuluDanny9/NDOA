"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Guest } from "./types"

export default function GuestExport({ guests }: { guests: Guest[] }) {
  function toCSV() {
    const header = ["lastName", "firstName", "phone", "email", "city", "tableNumber", "rsvpStatus"]
    const rows = [header.join(",")] // CSV
    guests.forEach((g) => {
      rows.push([g.lastName, g.firstName, g.phone ?? "", g.email ?? "", g.city ?? "", String(g.tableNumber ?? ""), g.rsvpStatus ?? ""].join(","))
    })
    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "guests-export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={toCSV}><Download className="mr-2"/>Export CSV (simulation)</Button>
    </div>
  )
}

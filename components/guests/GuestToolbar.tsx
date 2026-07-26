"use client"

import React from "react"
import { Plus, Upload, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GuestForm from "./GuestForm"
import { Guest } from "./types"

export default function GuestToolbar({
  onAdd,
  onImport,
  onExport,
  onSearch,
}: {
  onAdd?: (g: Guest) => void
  onImport?: () => void
  onExport?: () => void
  onSearch?: (q: string) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2" /> Ajouter un invité
        </Button>
        <Button variant="outline" onClick={onImport}>
          <Upload className="mr-2" /> Importer
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2" /> Exporter
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Input
          placeholder="Rechercher par nom, téléphone, email..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <GuestForm
        open={open}
        onOpenChange={setOpen}
        onSave={(guest) => {
          setOpen(false)
          onAdd?.(guest)
        }}
      />
    </div>
  )
}

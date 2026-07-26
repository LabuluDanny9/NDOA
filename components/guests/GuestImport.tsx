"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"

export default function GuestImport({ onPreview }: { onPreview?: (rows: string[][]) => void }) {
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      // simple CSV parse
      const rows = text.split(/\r?\n/).filter(Boolean).map((r) => r.split(","))
      onPreview?.(rows)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="file" ref={fileRef} onChange={onFile} />
      <Button variant="outline"><FileText className="mr-2"/>Prévisualiser (simulation)</Button>
    </div>
  )
}

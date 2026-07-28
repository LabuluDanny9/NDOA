"use client"

import React, { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Guest } from "./types"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code"

export default function GuestDetailsDialog({
  open,
  onOpenChange,
  guest,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  guest?: Guest | null
}) {
  const qrContainerRef = useRef<HTMLDivElement>(null)
  if (!guest) return null
  const currentGuest = guest
  const qrValue = `ndoa://guest/${currentGuest.inviteCode ?? currentGuest.id}`

  function downloadQr() {
    const svg = qrContainerRef.current?.querySelector("svg")
    if (!svg) return
    const source = new XMLSerializer().serializeToString(svg)
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `ndoa-guest-${currentGuest.lastName.toLowerCase()}.svg`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{guest.lastName} {guest.firstName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <div className="text-sm"><strong>Contact:</strong> {guest.phone} · {guest.email}</div>
          <div className="text-sm"><strong>Adresse:</strong> {guest.address}, {guest.city}</div>
          <div className="text-sm"><strong>Table:</strong> {guest.tableNumber ?? "-"}</div>
          <div className="text-sm"><strong>RSVP:</strong> {guest.rsvpStatus}</div>
          <div className="text-sm"><strong>Accompagnants:</strong> {guest.guestsCount ?? 0}</div>
          <div className="text-sm"><strong>Message:</strong> {guest.message ?? "-"}</div>
          <div ref={qrContainerRef} className="mx-auto rounded-xl bg-white p-3 shadow-sm">
            <QRCode value={qrValue} size={132} aria-label={`QR code de ${guest.firstName} ${guest.lastName}`} />
          </div>
          <Button type="button" variant="outline" onClick={downloadQr}>Télécharger le QR code</Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

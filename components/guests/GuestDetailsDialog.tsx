"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Guest } from "./types"
import { Button } from "@/components/ui/button"

export default function GuestDetailsDialog({
  open,
  onOpenChange,
  guest,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  guest?: Guest | null
}) {
  if (!guest) return null

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

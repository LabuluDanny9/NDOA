"use client"

import React from "react"
import { Guest } from "./types"
import { Card } from "@/components/ui/card"

export default function GuestCard({ guest }: { guest: Guest }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div>
          <div className="font-medium">{guest.lastName} {guest.firstName}</div>
          <div className="text-sm text-muted-foreground">{guest.phone} · {guest.email}</div>
          <div className="text-xs text-muted-foreground">Table {guest.tableNumber ?? "-"} · RSVP: {guest.rsvpStatus}</div>
        </div>
      </div>
    </Card>
  )
}

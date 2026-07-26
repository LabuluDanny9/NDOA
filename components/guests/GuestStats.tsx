"use client"

import React from "react"
import { Guest } from "./types"

export default function GuestStats({ guests }: { guests: Guest[] }) {
  const total = guests.length
  const present = guests.filter((g) => g.rsvpStatus === "present").length
  const absent = guests.filter((g) => g.rsvpStatus === "absent").length
  const pending = guests.filter((g) => g.rsvpStatus === "pending").length
  const maybe = guests.filter((g) => g.rsvpStatus === "maybe").length
  const vip = guests.filter((g) => g.vip).length
  const accompanists = guests.reduce((s, g) => s + (g.guestsCount ?? 0), 0)

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      <Stat label="Total" value={total} />
      <Stat label="Présents" value={present} />
      <Stat label="Absents" value={absent} />
      <Stat label="En attente" value={pending} />
      <Stat label="Peut-être" value={maybe} />
      <Stat label="VIP" value={vip} />
      <Stat label="Accompagnants" value={accompanists} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

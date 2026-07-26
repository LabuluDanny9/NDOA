"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { categories } from "./types"

export default function GuestFilters({
  onFilter,
}: {
  onFilter?: (filters: { category?: string; rsvp?: string; city?: string }) => void
}) {
  const [category, setCategory] = React.useState<string | undefined>(undefined)
  const [rsvp, setRsvp] = React.useState<string | undefined>(undefined)
  const [city, setCity] = React.useState<string | undefined>(undefined)

  function apply() {
    onFilter?.({ category, rsvp, city })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="input w-40" value={category ?? ""} onChange={(e) => setCategory(e.target.value || undefined)}>
        <option value="">Catégorie</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select className="input w-40" value={rsvp ?? ""} onChange={(e) => setRsvp(e.target.value || undefined)}>
        <option value="">Statut RSVP</option>
        <option value="present">Présent</option>
        <option value="absent">Absent</option>
        <option value="pending">En attente</option>
        <option value="maybe">Peut-être</option>
      </select>

      <input className="input w-40" placeholder="Ville" onChange={(e) => setCity(e.target.value || undefined)} />

      <Button variant="outline" onClick={apply}>Appliquer</Button>
    </div>
  )
}

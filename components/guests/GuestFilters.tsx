"use client"

import { Button } from "@/components/ui/button"
import { categories, type GuestFilterValues, type RSVPStatus } from "./types"

export default function GuestFilters({
  value,
  onChange,
}: {
  value: GuestFilterValues
  onChange: (filters: GuestFilterValues) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="min-h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        value={value.category ?? ""}
        aria-label="Filtrer par catégorie"
        onChange={(event) =>
          onChange({
            ...value,
            category: event.target.value || undefined,
          })
        }
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="min-h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        value={value.rsvp ?? ""}
        aria-label="Filtrer par statut RSVP"
        onChange={(event) =>
          onChange({
            ...value,
            rsvp: (event.target.value || undefined) as RSVPStatus | undefined,
          })
        }
      >
        <option value="">Tous les statuts RSVP</option>
        <option value="present">Présent</option>
        <option value="absent">Absent</option>
        <option value="pending">En attente</option>
        <option value="maybe">Peut-être</option>
      </select>

      <input
        className="min-h-9 w-44 rounded-lg border border-input bg-transparent px-3 text-sm"
        value={value.city ?? ""}
        placeholder="Filtrer par ville"
        aria-label="Filtrer par ville"
        onChange={(event) =>
          onChange({ ...value, city: event.target.value || undefined })
        }
      />

      <Button type="button" variant="ghost" onClick={() => onChange({})}>
        Effacer les filtres
      </Button>
    </div>
  )
}

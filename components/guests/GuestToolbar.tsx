"use client"

import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function GuestToolbar({
  onAdd,
  query,
  onQueryChange,
}: {
  onAdd: () => void
  query: string
  onQueryChange: (query: string) => void
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <Button type="button" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Ajouter un invité
      </Button>

      <div className="relative sm:ml-auto sm:w-full sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          className="pl-9"
          placeholder="Rechercher par nom, téléphone ou email…"
          aria-label="Rechercher un invité"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </div>
  )
}

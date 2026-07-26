"use client"

import React from "react"
import { Guest } from "./types"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Eye } from "lucide-react"
import GuestActions from "./GuestActions"

type Props = {
  guests: Guest[]
  onView?: (g: Guest) => void
  onEdit?: (g: Guest) => void
  onDelete?: (g: Guest) => void
}

export default function GuestTable({ guests, onView, onEdit, onDelete }: Props) {
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [asc, setAsc] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = guests.slice()
    if (q) {
      list = list.filter((g) => {
        return (
          g.firstName.toLowerCase().includes(q) ||
          g.lastName.toLowerCase().includes(q) ||
          (g.phone || "").toLowerCase().includes(q) ||
          (g.email || "").toLowerCase().includes(q)
        )
      })
    }

    if (sortKey) {
      list.sort((a: any, b: any) => {
        const va = a[sortKey] ?? ""
        const vb = b[sortKey] ?? ""
        if (va < vb) return asc ? -1 : 1
        if (va > vb) return asc ? 1 : -1
        return 0
      })
    }

    return list
  }, [guests, query, sortKey, asc])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) setAsc(!asc)
    else {
      setSortKey(key)
      setAsc(true)
    }
  }

  return (
    <div className="w-full overflow-auto">
      <div className="mb-2 flex items-center gap-2">
        <input
          className="input w-full"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <table className="w-full min-w-[720px] table-auto text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground">
            <th className="py-2 px-3">Nom</th>
            <th className="py-2 px-3">Téléphone</th>
            <th className="py-2 px-3">Catégorie</th>
            <th className="py-2 px-3">Table</th>
            <th className="py-2 px-3">RSVP</th>
            <th className="py-2 px-3">Accompagnants</th>
            <th className="py-2 px-3">Heure</th>
            <th className="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {current.map((g) => (
            <tr key={g.id} className="border-b last:border-b-0 hover:bg-muted/50">
              <td className="py-3 px-3">
                <div className="font-medium">{g.lastName} {g.firstName}</div>
                <div className="text-xs text-muted-foreground">{g.email}</div>
              </td>
              <td className="py-3 px-3">{g.phone}</td>
              <td className="py-3 px-3">{g.category}</td>
              <td className="py-3 px-3">{g.tableNumber ?? "-"}</td>
              <td className="py-3 px-3">{g.rsvpStatus}</td>
              <td className="py-3 px-3">{g.guestsCount ?? 0}</td>
              <td className="py-3 px-3">{g.arrivalTime ?? "-"}</td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView?.(g)}>
                    <Eye />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit?.(g)}>
                    <Edit />
                  </Button>
                  <GuestActions guest={g} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{total} invités</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Préc
          </Button>
          <div className="text-sm">{page} / {pages}</div>
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
            Suiv
          </Button>
        </div>
      </div>
    </div>
  )
}

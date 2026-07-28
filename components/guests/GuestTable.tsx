"use client"

import React from "react"
import type { Guest, GuestFilterValues } from "./types"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import GuestActions from "./GuestActions"

type Props = {
  guests: Guest[]
  query: string
  filters: GuestFilterValues
  onView: (guest: Guest) => void
  onEdit: (guest: Guest) => void
  onDelete: (guest: Guest) => void
  onDuplicate: (guest: Guest) => void
}

type SortKey = "lastName" | "category" | "tableNumber" | "rsvpStatus"

const rsvpLabels = {
  present: "Présent",
  absent: "Absent",
  pending: "En attente",
  maybe: "Peut-être",
} as const

export default function GuestTable({
  guests,
  query,
  filters,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: Props) {
  const [sortKey, setSortKey] = React.useState<SortKey>("lastName")
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

    if (filters.category) {
      list = list.filter((guest) => guest.category === filters.category)
    }
    if (filters.rsvp) {
      list = list.filter((guest) => guest.rsvpStatus === filters.rsvp)
    }
    if (filters.city?.trim()) {
      const city = filters.city.trim().toLowerCase()
      list = list.filter((guest) =>
        guest.city?.toLowerCase().includes(city)
      )
    }

    list.sort((a, b) => {
      const first = String(a[sortKey] ?? "").toLowerCase()
      const second = String(b[sortKey] ?? "").toLowerCase()
      return first.localeCompare(second, "fr", { numeric: true }) * (asc ? 1 : -1)
    })

    return list
  }, [asc, filters, guests, query, sortKey])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pages)
  const current = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const changeSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setAsc((value) => !value)
    } else {
      setSortKey(nextSortKey)
      setAsc(true)
    }
    setPage(1)
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[720px] table-auto text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground">
            <SortableHeader label="Nom" column="lastName" onSort={changeSort}>
              <SortIcon column="lastName" activeColumn={sortKey} asc={asc} />
            </SortableHeader>
            <th className="px-3 py-2">Téléphone</th>
            <SortableHeader label="Catégorie" column="category" onSort={changeSort}>
              <SortIcon column="category" activeColumn={sortKey} asc={asc} />
            </SortableHeader>
            <SortableHeader label="Table" column="tableNumber" onSort={changeSort}>
              <SortIcon column="tableNumber" activeColumn={sortKey} asc={asc} />
            </SortableHeader>
            <SortableHeader label="RSVP" column="rsvpStatus" onSort={changeSort}>
              <SortIcon column="rsvpStatus" activeColumn={sortKey} asc={asc} />
            </SortableHeader>
            <th className="py-2 px-3">Accompagnants</th>
            <th className="py-2 px-3">Heure</th>
            <th className="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {current.map((g) => (
            <tr key={g.id} className="border-b last:border-b-0 hover:bg-muted/50">
              <td className="px-3 py-3">
                <div className="font-medium">{g.lastName} {g.firstName}</div>
                <div className="text-xs text-muted-foreground">{g.email || "—"}</div>
              </td>
              <td className="py-3 px-3">{g.phone || "—"}</td>
              <td className="py-3 px-3">{g.category || "—"}</td>
              <td className="py-3 px-3">{g.tableNumber ?? "-"}</td>
              <td className="py-3 px-3">
                {g.rsvpStatus ? rsvpLabels[g.rsvpStatus] : "En attente"}
              </td>
              <td className="py-3 px-3">{g.guestsCount ?? 0}</td>
              <td className="py-3 px-3">{g.arrivalTime ?? "-"}</td>
              <td className="py-3 px-3">
                <GuestActions
                  guest={g}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total} invité{total > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Précédent
          </Button>
          <div className="text-sm">{currentPage} / {pages}</div>
          <Button variant="ghost" disabled={currentPage >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

function SortIcon({
  column,
  activeColumn,
  asc,
}: {
  column: SortKey
  activeColumn: SortKey
  asc: boolean
}) {
  if (activeColumn !== column) {
    return <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
  }
  return asc ? (
    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  )
}

function SortableHeader({
  label,
  column,
  onSort,
  children,
}: {
  label: string
  column: SortKey
  onSort: (column: SortKey) => void
  children: React.ReactNode
}) {
  return (
    <th className="px-3 py-2">
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-slate-950"
      >
        {label}
        {children}
      </button>
    </th>
  )
}

"use client"

import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import type { Guest } from "./types"

export default function GuestActions({
  guest,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  guest: Guest
  onView: (guest: Guest) => void
  onEdit: (guest: Guest) => void
  onDelete: (guest: Guest) => void
  onDuplicate: (guest: Guest) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions pour ${guest.firstName} ${guest.lastName}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(guest)}>
          <Eye aria-hidden="true" />
          Voir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(guest)}>
          <Pencil aria-hidden="true" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(guest)}>
          <Copy aria-hidden="true" />
          Dupliquer
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(guest)}
        >
          <Trash2 aria-hidden="true" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

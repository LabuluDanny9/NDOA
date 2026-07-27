"use client"

import React from "react"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Guest } from "./types"

export default function GuestActions({
  guest,
  onView,
  onEdit,
  onDelete,
}: {
  guest: Guest
  onView?: (g: Guest) => void
  onEdit?: (g: Guest) => void
  onDelete?: (g: Guest) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onView?.(guest)}>Voir</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit?.(guest)}>Modifier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete?.(guest)}>Supprimer</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(guest))}>Dupliquer</DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()}>Imprimer invitation</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          const blob = new Blob([guest.qrCode ?? ""], { type: "text/plain" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${guest.inviteCode ?? guest.id}-qrcode.txt`
          a.click()
          URL.revokeObjectURL(url)
        }}>Télécharger QR Code</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

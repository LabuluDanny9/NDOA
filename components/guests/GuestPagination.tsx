"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export default function GuestPagination({
  page,
  pages,
  onPage,
}: {
  page: number
  pages: number
  onPage: (p: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}>Préc</Button>
      <div className="text-sm">{page} / {pages}</div>
      <Button variant="ghost" onClick={() => onPage(Math.min(pages, page + 1))} disabled={page >= pages}>Suiv</Button>
    </div>
  )
}

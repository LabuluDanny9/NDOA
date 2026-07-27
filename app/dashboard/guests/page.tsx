"use client"

import React from "react"
import GuestToolbar from "@/components/guests/GuestToolbar"
import GuestStats from "@/components/guests/GuestStats"
import GuestFilters from "@/components/guests/GuestFilters"
import GuestTable from "@/components/guests/GuestTable"
import GuestImport from "@/components/guests/GuestImport"
import GuestExport from "@/components/guests/GuestExport"
import EmptyGuestState from "@/components/guests/EmptyGuestState"
import GuestDetailsDialog from "@/components/guests/GuestDetailsDialog"
import { mockGuests } from "@/components/guests/mockGuests"
import { Guest } from "@/components/guests/types"

export default function GuestsPage() {
  const [guests, setGuests] = React.useState<Guest[]>(() => mockGuests)
  const [selectedGuest, setSelectedGuest] = React.useState<Guest | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)

  function handleAdd(g: Guest) {
    setGuests((s) => [g, ...s])
  }

  function handleEdit(g: Guest) {
    setGuests((s) => s.map((x) => (x.id === g.id ? g : x)))
  }

  function handleDelete(g?: Guest) {
    if (!g) return
    setGuests((s) => s.filter((x) => x.id !== g.id))
  }

  function handleView(g: Guest) {
    setSelectedGuest(g)
    setDetailsOpen(true)
  }

  function handleImportPreview(rows: string[][]) {
    // simulation: map first column to lastName, second to firstName
    const parsed: Guest[] = rows.slice(0, 50).map((r, i) => ({
      id: `imp-${i}-${Date.now()}`,
      lastName: r[0] ?? `Import${i}`,
      firstName: r[1] ?? "",
      phone: undefined,
      email: undefined,
      address: "",
      city: undefined,
      province: undefined,
      country: undefined,
      gender: "other",
      dateOfBirth: undefined,
      category: undefined,
      family: false,
      friends: false,
      colleagues: false,
      vip: false,
      witnesses: false,
      bridesmaids: 0,
      groomsmen: 0,
      children: false,
      tableNumber: null,
      guestsCount: 0,
      rsvpStatus: "pending",
      arrivalTime: null,
      message: undefined,
      qrCode: undefined,
      inviteCode: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    setGuests((s) => [...parsed, ...s])
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-[1rem] bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-muted-foreground">Invités</p>
            <h1 className="text-2xl font-semibold">Gestion des invités</h1>
          </div>
          <div className="flex items-center gap-4">
            <GuestImport onPreview={handleImportPreview} />
            <GuestExport guests={guests} />
          </div>
        </div>

        <div className="mt-4">
          <GuestToolbar
            onAdd={handleAdd}
            onImport={() => {}}
            onExport={() => {}}
            onSearch={() => { /* delegated to table local search */ }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-[1rem] bg-white p-6 shadow">
            <GuestFilters onFilter={() => {}} />
            <div className="mt-4">
              {guests.length === 0 ? (
                <EmptyGuestState onAdd={() => {}} />
              ) : (
                <GuestTable guests={guests} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1rem] bg-white p-6 shadow">
            <GuestStats guests={guests} />
          </div>
        </div>
      </div>

      <GuestDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} guest={selectedGuest} />
    </main>
  )
}

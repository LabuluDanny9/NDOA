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
import GuestForm from "@/components/guests/GuestForm"
import { mockGuests } from "@/components/guests/mockGuests"
import type { Guest, GuestFilterValues } from "@/components/guests/types"
import { useToast } from "@/components/ui/toast"

export default function GuestsPage() {
  const { toast } = useToast()
  const [guests, setGuests] = React.useState<Guest[]>(() => mockGuests)
  const [query, setQuery] = React.useState("")
  const [filters, setFilters] = React.useState<GuestFilterValues>({})
  const [selectedGuest, setSelectedGuest] = React.useState<Guest | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingGuest, setEditingGuest] = React.useState<Guest | null>(null)

  function openCreateForm() {
    setEditingGuest(null)
    setFormOpen(true)
  }

  function openEditForm(guest: Guest) {
    setEditingGuest(guest)
    setFormOpen(true)
  }

  function handleSave(guest: Guest) {
    const isEditing = guests.some((item) => item.id === guest.id)
    setGuests((currentGuests) => {
      const exists = currentGuests.some((item) => item.id === guest.id)
      return exists
        ? currentGuests.map((item) => (item.id === guest.id ? guest : item))
        : [guest, ...currentGuests]
    })
    setFormOpen(false)
    setEditingGuest(null)
    toast({
      title: isEditing ? "Invité modifié" : "Invité ajouté",
      description: `${guest.firstName} ${guest.lastName}`,
      variant: "success",
    })
  }

  function handleDelete(guest: Guest) {
    const confirmed = window.confirm(
      `Supprimer ${guest.firstName} ${guest.lastName} de la liste ?`
    )
    if (!confirmed) return

    setGuests((currentGuests) =>
      currentGuests.filter((item) => item.id !== guest.id)
    )
    toast({
      title: "Invité supprimé",
      description: `${guest.firstName} ${guest.lastName}`,
    })
  }

  function handleDuplicate(guest: Guest) {
    const timestamp = new Date().toISOString()
    setGuests((currentGuests) => [
      {
        ...guest,
        id: `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        lastName: `${guest.lastName} (copie)`,
        inviteCode: undefined,
        qrCode: undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...currentGuests,
    ])
    toast({
      title: "Invité dupliqué",
      description: `Une copie de ${guest.firstName} ${guest.lastName} a été créée.`,
      variant: "success",
    })
  }

  function handleView(guest: Guest) {
    setSelectedGuest(guest)
    setDetailsOpen(true)
  }

  function handleImport(importedGuests: Guest[]) {
    setGuests((currentGuests) => [...importedGuests, ...currentGuests])
    toast({
      title: "Import terminé",
      description: `${importedGuests.length} invité${importedGuests.length > 1 ? "s" : ""} ajouté${importedGuests.length > 1 ? "s" : ""}.`,
      variant: "success",
    })
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-[1rem] bg-white p-6 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Invités</p>
            <h1 className="text-2xl font-semibold">Gestion des invités</h1>
            <p className="mt-2 text-sm text-slate-600">
              Ajoutez, recherchez, filtrez et échangez votre liste au format CSV.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <GuestImport onImport={handleImport} />
            <GuestExport guests={guests} />
          </div>
        </div>

        <div className="mt-4">
          <GuestToolbar
            onAdd={openCreateForm}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-[1rem] bg-white p-6 shadow">
            <GuestFilters value={filters} onChange={setFilters} />
            <div className="mt-4">
              {guests.length === 0 ? (
                <EmptyGuestState onAdd={openCreateForm} />
              ) : (
                <GuestTable
                  guests={guests}
                  query={query}
                  filters={filters}
                  onView={handleView}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
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
      <GuestForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingGuest(null)
        }}
        initialData={editingGuest}
        onSave={handleSave}
      />
    </main>
  )
}

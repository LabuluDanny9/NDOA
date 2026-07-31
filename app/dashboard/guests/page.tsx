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
import type { Guest, GuestFilterValues } from "@/components/guests/types"
import { useToast } from "@/components/ui/toast"
import { createGuest, deleteGuest, fromGuestApiRow, listGuests, updateGuest, GuestClientError } from "@/lib/guests/client"
import { deleteLocalGuest, duplicateLocalGuest, readLocalGuests, saveLocalGuest } from "@/lib/guests/local-store"
import { resolveActiveWedding } from "@/lib/weddings/active"

function copyId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export default function GuestsPage() {
  const { toast } = useToast()
  const [guests, setGuests] = React.useState<Guest[]>([])
  const [weddingId, setWeddingId] = React.useState<string | null>(null)
  const [dataSource, setDataSource] = React.useState<"api" | "local">("local")
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [filters, setFilters] = React.useState<GuestFilterValues>({})
  const [selectedGuest, setSelectedGuest] = React.useState<Guest | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingGuest, setEditingGuest] = React.useState<Guest | null>(null)

  const loadGuests = React.useCallback(async (targetWeddingId: string, preferredSource: "api" | "local" = "api") => {
    setLoading(true)
    if (preferredSource === "local") {
      setGuests(readLocalGuests(targetWeddingId))
      setDataSource("local")
      setLoading(false)
      return
    }
    try {
      const response = await listGuests(targetWeddingId)
      setGuests(response.items.map(fromGuestApiRow))
      setDataSource("api")
    } catch (error) {
      if (!(error instanceof GuestClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") {
        toast({ title: "Chargement impossible", description: error instanceof GuestClientError ? error.message : "Réessayez.", variant: "error" })
      }
      setGuests(readLocalGuests(targetWeddingId))
      setDataSource("local")
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void resolveActiveWedding().then((active) => {
        const target = active.wedding?.id ?? null
        setWeddingId(target)
        setDataSource(active.source)
        if (target) void loadGuests(target, active.source)
        else {
          setGuests([])
          setLoading(false)
        }
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadGuests])

  function openCreateForm() { setEditingGuest(null); setFormOpen(true) }
  function openEditForm(guest: Guest) { setEditingGuest(guest); setFormOpen(true) }
  function handleView(guest: Guest) { setSelectedGuest(guest); setDetailsOpen(true) }

  async function handleSave(guest: Guest) {
    const isEditing = guests.some((item) => item.id === guest.id)
    try {
      if (!weddingId) throw new Error("Créez d’abord un mariage avant d’ajouter des invités.")
      const saved = dataSource === "api"
        ? fromGuestApiRow(isEditing ? await updateGuest(weddingId, guest) : await createGuest(weddingId, guest))
        : saveLocalGuest(weddingId, guest)
      setGuests((current) => isEditing ? current.map((item) => item.id === guest.id ? saved : item) : [saved, ...current])
      setFormOpen(false)
      setEditingGuest(null)
      toast({ title: isEditing ? "Invité modifié" : "Invité ajouté", description: `${saved.firstName} ${saved.lastName}`, variant: "success" })
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: error instanceof GuestClientError ? error.message : "Réessayez.", variant: "error" })
    }
  }

  async function handleDelete(guest: Guest) {
    if (!window.confirm(`Supprimer ${guest.firstName} ${guest.lastName} de la liste ?`)) return
    try {
      if (!weddingId) return
      if (dataSource === "api") await deleteGuest(weddingId, guest.id)
      else deleteLocalGuest(weddingId, guest.id)
      setGuests((current) => current.filter((item) => item.id !== guest.id))
      toast({ title: "Invité supprimé", description: `${guest.firstName} ${guest.lastName}`, variant: "success" })
    } catch (error) {
      toast({ title: "Suppression impossible", description: error instanceof GuestClientError ? error.message : "Réessayez.", variant: "error" })
    }
  }

  async function handleDuplicate(guest: Guest) {
    const now = new Date().toISOString()
    const draft: Guest = { ...guest, id: `copy-${copyId()}`, lastName: `${guest.lastName} (copie)`, inviteCode: undefined, qrCode: undefined, createdAt: now, updatedAt: now }
    try {
      if (!weddingId) throw new Error("Créez d’abord un mariage avant de dupliquer un invité.")
      const saved = dataSource === "api" ? fromGuestApiRow(await createGuest(weddingId, draft)) : duplicateLocalGuest(weddingId, guest)
      setGuests((current) => [saved, ...current])
      toast({ title: "Invité dupliqué", description: `Une copie de ${guest.firstName} ${guest.lastName} a été créée.`, variant: "success" })
    } catch (error) {
      toast({ title: "Duplication impossible", description: error instanceof GuestClientError ? error.message : "Réessayez.", variant: "error" })
    }
  }

  async function handleImport(importedGuests: Guest[]) {
    try {
      if (!weddingId) throw new Error("Créez d’abord un mariage avant d’importer des invités.")
      const saved = dataSource === "api"
        ? (await Promise.all(importedGuests.map((guest) => createGuest(weddingId, guest)))).map(fromGuestApiRow)
        : importedGuests.map((guest) => saveLocalGuest(weddingId, guest))
      setGuests((current) => [...saved, ...current])
      toast({ title: "Import terminé", description: `${saved.length} invité${saved.length > 1 ? "s" : ""} ajouté${saved.length > 1 ? "s" : ""}.`, variant: "success" })
    } catch (error) {
      toast({ title: "Import impossible", description: error instanceof GuestClientError ? error.message : "Réessayez.", variant: "error" })
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-[1rem] bg-white p-6 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Invités</p>
            <h1 className="text-2xl font-semibold">Gestion des invités</h1>
            <p className="mt-2 text-sm text-slate-600">Ajoutez, recherchez, filtrez et échangez votre liste en CSV ou Excel.</p>
          </div>
          <div className="flex flex-wrap items-start gap-3"><GuestImport onImport={handleImport} /><GuestExport guests={guests} /></div>
        </div>
        <div className="mt-4"><GuestToolbar onAdd={openCreateForm} query={query} onQueryChange={setQuery} /></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-[1rem] bg-white p-6 shadow">
            <GuestFilters value={filters} onChange={setFilters} />
            <div className="mt-4">
              {loading ? (
                <p className="p-6 text-center text-sm text-slate-500">Chargement des invités…</p>
              ) : (
                <div className="space-y-4">
                  {guests.length === 0 ? <EmptyGuestState onAdd={openCreateForm} /> : null}
                  <GuestTable guests={guests} query={query} filters={filters} onView={handleView} onEdit={openEditForm} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4"><div className="rounded-[1rem] bg-white p-6 shadow"><GuestStats guests={guests} /></div></div>
      </div>
      <GuestDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} guest={selectedGuest} />
      <GuestForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingGuest(null) }} initialData={editingGuest} onSave={handleSave} />
    </main>
  )
}

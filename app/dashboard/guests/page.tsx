"use client"

import React from "react"
import { Download, Sparkles, Upload, Users } from "lucide-react"
import EmptyGuestState from "@/components/guests/EmptyGuestState"
import GuestDetailsDialog from "@/components/guests/GuestDetailsDialog"
import GuestExport from "@/components/guests/GuestExport"
import GuestFilters from "@/components/guests/GuestFilters"
import GuestForm from "@/components/guests/GuestForm"
import GuestImport from "@/components/guests/GuestImport"
import GuestStats from "@/components/guests/GuestStats"
import GuestTable from "@/components/guests/GuestTable"
import GuestToolbar from "@/components/guests/GuestToolbar"
import type { Guest, GuestFilterValues } from "@/components/guests/types"
import { useToast } from "@/components/ui/toast"
import { createGuest, deleteGuest, fromGuestApiRow, GuestClientError, listGuests, updateGuest } from "@/lib/guests/client"
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
        toast({ title: "Chargement impossible", description: error instanceof GuestClientError ? error.message : "Reessayez.", variant: "error" })
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
      if (!weddingId) throw new Error("Creez d'abord un mariage avant d'ajouter des invites.")
      const saved = dataSource === "api"
        ? fromGuestApiRow(isEditing ? await updateGuest(weddingId, guest) : await createGuest(weddingId, guest))
        : saveLocalGuest(weddingId, guest)
      setGuests((current) => isEditing ? current.map((item) => item.id === guest.id ? saved : item) : [saved, ...current])
      setFormOpen(false)
      setEditingGuest(null)
      toast({ title: isEditing ? "Invite modifie" : "Invite ajoute", description: `${saved.firstName} ${saved.lastName}`, variant: "success" })
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: error instanceof GuestClientError ? error.message : "Reessayez.", variant: "error" })
    }
  }

  async function handleDelete(guest: Guest) {
    if (!window.confirm(`Supprimer ${guest.firstName} ${guest.lastName} de la liste ?`)) return
    try {
      if (!weddingId) return
      if (dataSource === "api") await deleteGuest(weddingId, guest.id)
      else deleteLocalGuest(weddingId, guest.id)
      setGuests((current) => current.filter((item) => item.id !== guest.id))
      toast({ title: "Invite supprime", description: `${guest.firstName} ${guest.lastName}`, variant: "success" })
    } catch (error) {
      toast({ title: "Suppression impossible", description: error instanceof GuestClientError ? error.message : "Reessayez.", variant: "error" })
    }
  }

  async function handleDuplicate(guest: Guest) {
    const now = new Date().toISOString()
    const draft: Guest = { ...guest, id: `copy-${copyId()}`, lastName: `${guest.lastName} (copie)`, inviteCode: undefined, qrCode: undefined, createdAt: now, updatedAt: now }
    try {
      if (!weddingId) throw new Error("Creez d'abord un mariage avant de dupliquer un invite.")
      const saved = dataSource === "api" ? fromGuestApiRow(await createGuest(weddingId, draft)) : duplicateLocalGuest(weddingId, guest)
      setGuests((current) => [saved, ...current])
      toast({ title: "Invite duplique", description: `Une copie de ${guest.firstName} ${guest.lastName} a ete creee.`, variant: "success" })
    } catch (error) {
      toast({ title: "Duplication impossible", description: error instanceof GuestClientError ? error.message : "Reessayez.", variant: "error" })
    }
  }

  async function handleImport(importedGuests: Guest[]) {
    try {
      if (!weddingId) throw new Error("Creez d'abord un mariage avant d'importer des invites.")
      const saved = dataSource === "api"
        ? (await Promise.all(importedGuests.map((guest) => createGuest(weddingId, guest)))).map(fromGuestApiRow)
        : importedGuests.map((guest) => saveLocalGuest(weddingId, guest))
      setGuests((current) => [...saved, ...current])
      toast({ title: "Import termine", description: `${saved.length} invite${saved.length > 1 ? "s" : ""} ajoute${saved.length > 1 ? "s" : ""}.`, variant: "success" })
    } catch (error) {
      toast({ title: "Import impossible", description: error instanceof GuestClientError ? error.message : "Reessayez.", variant: "error" })
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(14,116,144,0.85))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-amber-200">
              <Sparkles className="size-4" />
              Invites
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">Gestion des invites</h1>
            <p className="mt-3 text-sm leading-6 text-blue-50/92">Ajoutez, recherchez, filtrez, importez et exportez votre liste d&apos;invites dans une interface plus claire, plus moderne et plus fluide.</p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <GuestImport onImport={handleImport} />
            <GuestExport guests={guests} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Invites total</p>
            <Users className="size-5 text-blue-700" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{guests.length}</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Source</p>
            <Upload className="size-5 text-amber-500" />
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-950">{dataSource === "api" ? "Supabase" : "Locale"}</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Exports</p>
            <Download className="size-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-950">CSV / Excel</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="surface-card p-6">
            <div className="mb-4">
              <GuestToolbar onAdd={openCreateForm} query={query} onQueryChange={setQuery} />
            </div>
            <GuestFilters value={filters} onChange={setFilters} />
            <div className="mt-4">
              {loading ? (
                <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Chargement des invites...</p>
              ) : (
                <div className="space-y-4">
                  {guests.length === 0 ? <EmptyGuestState onAdd={openCreateForm} /> : null}
                  <GuestTable guests={guests} query={query} filters={filters} onView={handleView} onEdit={openEditForm} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-6">
            <GuestStats guests={guests} />
          </div>
        </div>
      </div>

      <GuestDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} guest={selectedGuest} />
      <GuestForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingGuest(null) }} initialData={editingGuest} onSave={handleSave} />
    </main>
  )
}

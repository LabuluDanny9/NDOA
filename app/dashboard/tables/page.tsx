"use client"

import { useEffect, useMemo, useState } from "react"
import { Armchair, Plus, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listGuests, fromGuestApiRow } from "@/lib/guests/client"
import { readLocalGuests } from "@/lib/guests/local-store"
import { listWeddings, fromWeddingApiRow, type WeddingSummary } from "@/lib/weddings/client"
import { readLocalWeddings } from "@/lib/weddings/local-store"
import type { Guest } from "@/components/guests/types"

type TableRow = {
  id: string
  name: string
  capacity: number
  location: string | null
  position: number
}

async function requestTables(weddingId: string) {
  const response = await fetch(`/api/weddings/${encodeURIComponent(weddingId)}/guest-tables?pageSize=100`)
  const body = await response.json() as { data?: { items?: TableRow[] }; error?: { message?: string } }
  if (!response.ok || !body.data?.items) throw new Error(body.error?.message ?? "Plan de tables indisponible.")
  return body.data.items
}

async function createRemoteTable(weddingId: string, input: Pick<TableRow, "name" | "capacity" | "location">) {
  const response = await fetch(`/api/weddings/${encodeURIComponent(weddingId)}/guest-tables`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, shape: "round", position: 0 }),
  })
  const body = await response.json() as { data?: TableRow; error?: { message?: string } }
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Création de table impossible.")
  return body.data
}

function demoTables(): TableRow[] {
  return [
    { id: "demo-1", name: "Table Famille", capacity: 10, location: "Salle principale", position: 1 },
    { id: "demo-2", name: "Table Amis", capacity: 8, location: "Côté piste", position: 2 },
    { id: "demo-3", name: "Table VIP", capacity: 6, location: "Devant scène", position: 3 },
  ]
}

export default function TablesPage() {
  const [wedding, setWedding] = useState<WeddingSummary | null>(null)
  const [tables, setTables] = useState<TableRow[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [source, setSource] = useState<"api" | "local">("local")
  const [name, setName] = useState("")
  const [capacity, setCapacity] = useState("8")
  const [location, setLocation] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const weddings = await listWeddings()
        const selected = weddings.items[0] ? fromWeddingApiRow(weddings.items[0]) : null
        if (!selected) throw new Error("Aucun mariage.")
        const [tableRows, guestRows] = await Promise.all([
          requestTables(selected.id),
          listGuests(selected.id),
        ])
        if (!mounted) return
        setWedding(selected)
        setTables(tableRows)
        setGuests(guestRows.items.map(fromGuestApiRow))
        setSource("api")
      } catch {
        const weddings = readLocalWeddings()
        const selected = weddings[0] ?? null
        const weddingId = selected?.id ?? "demo-wedding"
        if (!mounted) return
        setWedding(selected)
        setTables(demoTables())
        setGuests(readLocalGuests(weddingId))
        setSource("local")
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const totalSeats = useMemo(() => tables.reduce((sum, table) => sum + table.capacity, 0), [tables])

  async function addTable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedCapacity = Math.max(1, Number(capacity) || 1)
    setSaving(true)
    try {
      if (source === "api" && wedding) {
        const created = await createRemoteTable(wedding.id, {
          name,
          capacity: parsedCapacity,
          location: location || null,
        })
        setTables((current) => [...current, created])
      } else {
        setTables((current) => [
          ...current,
          { id: `local-${Date.now()}`, name, capacity: parsedCapacity, location: location || null, position: current.length + 1 },
        ])
      }
      setName("")
      setCapacity("8")
      setLocation("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-blue-100">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Plan de tables</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Organiser les places</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Créez les tables, indiquez leurs capacités et gardez une vision claire du nombre de places disponibles.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Mariage" value={wedding?.name ?? "Démo NDOA"} />
          <SummaryCard label="Tables" value={tables.length} />
          <SummaryCard label="Places totales" value={totalSeats} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={addTable} className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Armchair className="size-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-slate-950">Nouvelle table</h2>
          </div>
          <div className="mt-6 grid gap-4">
            <Input aria-label="Nom de la table" value={name} onChange={(event) => setName(event.target.value)} placeholder="Table Famille" required minLength={2} />
            <Input aria-label="Capacité" value={capacity} onChange={(event) => setCapacity(event.target.value)} type="number" min={1} max={100} />
            <Input aria-label="Emplacement" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Salle principale" />
            <Button type="submit" disabled={saving} className="bg-blue-700 text-white hover:bg-blue-800">
              <Plus className="size-4" />
              Ajouter la table
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Source : {source === "api" ? "Supabase" : "local/démo"}
          </p>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {tables.map((table) => (
            <article key={table.id} className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{table.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{table.location ?? "Emplacement à préciser"}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  {table.capacity} places
                </span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                <UsersRound className="size-4 text-blue-700" />
                Affectation invités prête pour la prochaine sélection dans la fiche invité.
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-blue-100 bg-blue-700 p-6 text-white shadow-sm">
        <h2 className="text-xl font-semibold">Capacité globale</h2>
        <p className="mt-2 text-sm text-blue-50">
          {guests.length} invité(s) enregistrés pour {totalSeats} place(s). Ajoutez les invités depuis “Invités”, puis utilisez ce plan pour répartir les groupes.
        </p>
      </section>
    </main>
  )
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Armchair, Plus, Sparkles, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fromGuestApiRow, listGuests } from "@/lib/guests/client"
import { readLocalGuests } from "@/lib/guests/local-store"
import { fromWeddingApiRow, listWeddings, type WeddingSummary } from "@/lib/weddings/client"
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
  if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Creation de table impossible.")
  return body.data
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
        if (!mounted) return
        setWedding(selected)
        setTables([])
        setGuests(selected ? readLocalGuests(selected.id) : [])
        setSource("local")
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const totalSeats = useMemo(() => tables.reduce((sum, table) => sum + table.capacity, 0), [tables])
  const missingSeats = Math.max(guests.length - totalSeats, 0)

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
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(245,158,11,0.78))] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200"><Sparkles className="size-4" /> Plan de tables</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Organiser les places reelles</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">
          Les tables affichees sont celles que vous creez pour {wedding?.name ?? "votre mariage"}. Aucune table fictive n&apos;est ajoutee automatiquement.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Mariage" value={wedding?.name ?? "Aucun mariage"} />
          <SummaryCard label="Invites reels" value={guests.length} />
          <SummaryCard label="Tables" value={tables.length} />
          <SummaryCard label="Places restantes" value={Math.max(totalSeats - guests.length, 0)} />
        </div>
      </section>

      {!wedding ? (
        <section className="surface-card border border-dashed border-blue-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">Creez d&apos;abord un mariage</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Le plan de tables doit etre lie a un mariage reel pour que les capacites et les invites correspondent.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/create-wedding">Creer un mariage</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={addTable} className="surface-card p-6">
            <div className="flex items-center gap-3">
              <Armchair className="size-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-slate-950">Nouvelle table</h2>
            </div>
            <div className="mt-6 grid gap-4">
              <Input aria-label="Nom de la table" value={name} onChange={(event) => setName(event.target.value)} placeholder="Table Famille" required minLength={2} />
              <Input aria-label="Capacite" value={capacity} onChange={(event) => setCapacity(event.target.value)} type="number" min={1} max={100} />
              <Input aria-label="Emplacement" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Salle principale" />
              <Button type="submit" disabled={saving}>
                <Plus className="size-4" />
                Ajouter la table
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">Source : {source === "api" ? "Supabase" : "donnees locales reellement enregistrees"}</p>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {tables.length ? tables.map((table) => (
              <article key={table.id} className="surface-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{table.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{table.location ?? "Emplacement a preciser"}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">{table.capacity} places</span>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                  <UsersRound className="size-4 text-blue-700" />
                  Table creee pour {wedding.name}.
                </div>
              </article>
            )) : (
              <div className="surface-card border border-dashed border-blue-200 p-8 text-sm text-slate-600 md:col-span-2">
                Aucune table creee pour ce mariage. Ajoutez votre premiere table a gauche.
              </div>
            )}
          </div>
        </section>
      )}

      <section className="hero-glow rounded-[2rem] border border-blue-100 bg-blue-700 p-6 text-white shadow-sm">
        <h2 className="text-xl font-semibold">Capacite globale</h2>
        <p className="mt-2 text-sm text-blue-50">
          {guests.length} invite(s) enregistres pour {totalSeats} place(s). {missingSeats > 0 ? `${missingSeats} place(s) a prevoir.` : "La capacite actuelle couvre les invites enregistres."}
        </p>
      </section>
    </main>
  )
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-sm text-blue-100/80">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CalendarDays, Copy, ExternalLink, Loader2, Pencil, Plus, Send, Sparkles, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import {
  createWedding,
  deleteWedding,
  formValuesFromWeddingApi,
  fromWeddingApiRow,
  getWedding,
  listWeddings,
  setWeddingStatus,
  type WeddingStatus,
  WeddingClientError,
  type WeddingSummary,
} from "@/lib/weddings/client"
import { asSummary, deleteLocalWedding, duplicateLocalWedding, readLocalWeddings, setLocalWeddingStatus } from "@/lib/weddings/local-store"

function formatDate(value: string | null) {
  if (!value) return "Date a definir"
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`))
}

function statusLabel(status: WeddingStatus) {
  return status === "published" ? "Publie" : status === "archived" ? "Archive" : "Brouillon"
}

function statusClass(status: WeddingStatus) {
  return status === "published" ? "bg-emerald-100 text-emerald-700" : status === "archived" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700"
}

function duplicateName(name: string) {
  return `${name} (copie ${new Date().toISOString().slice(11, 19).replaceAll(":", "")})`
}

export default function WeddingsPage() {
  const { toast } = useToast()
  const [weddings, setWeddings] = useState<WeddingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadWeddings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listWeddings()
      setWeddings(response.items.map(fromWeddingApiRow))
    } catch (error) {
      if (!(error instanceof WeddingClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") {
        toast({ title: "Chargement impossible", description: error instanceof WeddingClientError ? error.message : "Reessayez dans quelques instants.", variant: "error" })
      }
      setWeddings(readLocalWeddings().map(asSummary))
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadWeddings() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadWeddings])

  async function changeStatus(wedding: WeddingSummary, status: Exclude<WeddingStatus, "archived">) {
    setBusyId(wedding.id)
    try {
      if (wedding.source === "local") setLocalWeddingStatus(wedding.id, status)
      else await setWeddingStatus(wedding.id, status)
      toast({ title: status === "published" ? "Mariage publie" : "Brouillon enregistre", variant: "success" })
      await loadWeddings()
    } catch (error) {
      toast({ title: "Action impossible", description: error instanceof WeddingClientError ? error.message : "Reessayez.", variant: "error" })
    } finally {
      setBusyId(null)
    }
  }

  async function duplicate(wedding: WeddingSummary) {
    setBusyId(wedding.id)
    try {
      if (wedding.source === "local") {
        duplicateLocalWedding(wedding.id)
      } else {
        const row = await getWedding(wedding.id)
        const values = formValuesFromWeddingApi(row)
        values.weddingName = duplicateName(values.weddingName)
        await createWedding(values)
      }
      toast({ title: "Mariage duplique", description: "Une nouvelle version en brouillon a ete creee.", variant: "success" })
      await loadWeddings()
    } catch (error) {
      toast({ title: "Duplication impossible", description: error instanceof WeddingClientError ? error.message : "Reessayez.", variant: "error" })
    } finally {
      setBusyId(null)
    }
  }

  async function remove(wedding: WeddingSummary) {
    if (!window.confirm(`Supprimer « ${wedding.name} » ? Cette action est irreversible.`)) return
    setBusyId(wedding.id)
    try {
      if (wedding.source === "local") deleteLocalWedding(wedding.id)
      else await deleteWedding(wedding.id)
      toast({ title: "Mariage supprime", variant: "success" })
      await loadWeddings()
    } catch (error) {
      toast({ title: "Suppression impossible", description: error instanceof WeddingClientError ? error.message : "Reessayez.", variant: "error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(245,158,11,0.78))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-amber-200">
              <Sparkles className="size-4" />
              Espace organisateur
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">Mes mariages</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/92">Creez, modifiez, dupliquez et publiez vos evenements depuis une vue plus elegante et plus confortable a utiliser.</p>
          </div>
          <Button asChild size="lg" className="self-start sm:self-auto">
            <Link href="/dashboard/create-wedding"><Plus className="size-4" /> Nouveau mariage</Link>
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="surface-card flex items-center justify-center p-16 text-slate-500"><Loader2 className="mr-3 size-5 animate-spin" /> Chargement des mariages...</div>
      ) : weddings.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <CalendarDays className="mx-auto size-10 text-amber-500" />
          <CardTitle className="mt-5 text-2xl">Aucun mariage</CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md">Commencez par creer votre premier evenement. Il sera enregistre dans Supabase ou localement en mode demonstration.</CardDescription>
          <Button asChild className="mt-6"><Link href="/dashboard/create-wedding">Creer mon mariage</Link></Button>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="surface-card p-5"><p className="text-sm text-slate-500">Total</p><p className="mt-3 text-3xl font-semibold text-slate-950">{weddings.length}</p></div>
            <div className="surface-card p-5"><p className="text-sm text-slate-500">Publies</p><p className="mt-3 text-3xl font-semibold text-slate-950">{weddings.filter((item) => item.status === "published").length}</p></div>
            <div className="surface-card p-5"><p className="text-sm text-slate-500">Brouillons</p><p className="mt-3 text-3xl font-semibold text-slate-950">{weddings.filter((item) => item.status === "draft").length}</p></div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            {weddings.map((wedding) => {
              const busy = busyId === wedding.id
              return (
                <Card key={wedding.id} className="overflow-hidden">
                  <CardHeader className="gap-4 border-b border-slate-100/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.7))] px-6 py-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl text-slate-900">{wedding.name}</CardTitle>
                        <CardDescription className="mt-1">{wedding.partnerOneName} & {wedding.partnerTwoName}</CardDescription>
                      </div>
                      <Badge className={`rounded-full ${statusClass(wedding.status)}`}>{statusLabel(wedding.status)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-amber-600" />{formatDate(wedding.weddingDate)}</span>
                      <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-slate-300" />{wedding.source === "local" ? "Mode demo local" : "Supabase"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 px-6 py-5">
                    <Button asChild variant="outline" size="sm"><Link href={`/dashboard/weddings/${wedding.id}`}><Pencil className="size-4" /> Modifier</Link></Button>
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void duplicate(wedding)}><Copy className="size-4" /> Dupliquer</Button>
                    {wedding.status === "published" ? (
                      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void changeStatus(wedding, "draft")}><Send className="size-4" /> Repasser en brouillon</Button>
                    ) : (
                      <Button type="button" size="sm" disabled={busy} onClick={() => void changeStatus(wedding, "published")}><Send className="size-4" /> Publier</Button>
                    )}
                    <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => void remove(wedding)}><Trash2 className="size-4" /> Supprimer</Button>
                    {wedding.status === "published" ? <Button asChild variant="ghost" size="sm"><Link href={`/invitation/${wedding.slug}`} target="_blank"><ExternalLink className="size-4" /> Voir l&apos;invitation</Link></Button> : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}

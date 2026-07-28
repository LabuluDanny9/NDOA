"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CalendarDays, Copy, ExternalLink, Loader2, Pencil, Plus, Send, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import {
  deleteWedding,
  formValuesFromWeddingApi,
  fromWeddingApiRow,
  getWedding,
  listWeddings,
  setWeddingStatus,
  type WeddingStatus,
  WeddingClientError,
  type WeddingSummary,
  createWedding,
} from "@/lib/weddings/client"
import {
  asSummary,
  deleteLocalWedding,
  duplicateLocalWedding,
  readLocalWeddings,
  setLocalWeddingStatus,
} from "@/lib/weddings/local-store"

function formatDate(value: string | null) {
  if (!value) return "Date à définir"
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`))
}

function statusLabel(status: WeddingStatus) {
  return status === "published" ? "Publié" : status === "archived" ? "Archivé" : "Brouillon"
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
        toast({ title: "Chargement impossible", description: error instanceof WeddingClientError ? error.message : "Réessayez dans quelques instants.", variant: "error" })
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
      toast({ title: status === "published" ? "Mariage publié" : "Brouillon enregistré", variant: "success" })
      await loadWeddings()
    } catch (error) {
      toast({ title: "Action impossible", description: error instanceof WeddingClientError ? error.message : "Réessayez.", variant: "error" })
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
      toast({ title: "Mariage dupliqué", description: "Une nouvelle version en brouillon a été créée.", variant: "success" })
      await loadWeddings()
    } catch (error) {
      toast({ title: "Duplication impossible", description: error instanceof WeddingClientError ? error.message : "Réessayez.", variant: "error" })
    } finally {
      setBusyId(null)
    }
  }

  async function remove(wedding: WeddingSummary) {
    if (!window.confirm(`Supprimer « ${wedding.name} » ? Cette action est irréversible.`)) return
    setBusyId(wedding.id)
    try {
      if (wedding.source === "local") deleteLocalWedding(wedding.id)
      else await deleteWedding(wedding.id)
      toast({ title: "Mariage supprimé", variant: "success" })
      await loadWeddings()
    } catch (error) {
      toast({ title: "Suppression impossible", description: error instanceof WeddingClientError ? error.message : "Réessayez.", variant: "error" })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Espace organisateur</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Mes mariages</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Créez, modifiez, dupliquez et publiez vos événements depuis une seule vue.</p>
        </div>
        <Button asChild className="rounded-full bg-amber-500 px-5 text-white hover:bg-amber-600">
          <Link href="/dashboard/create-wedding"><Plus className="size-4" /> Nouveau mariage</Link>
        </Button>
      </section>

      {loading ? (
        <div className="flex items-center justify-center rounded-[2rem] bg-white p-16 text-slate-500"><Loader2 className="mr-3 size-5 animate-spin" /> Chargement des mariages…</div>
      ) : weddings.length === 0 ? (
        <Card className="rounded-[2rem] border-dashed p-8 text-center">
          <CalendarDays className="mx-auto size-10 text-amber-500" />
          <CardTitle className="mt-5 text-2xl">Aucun mariage</CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md">Commencez par créer votre premier événement. Il sera enregistré dans Supabase ou localement en mode démonstration.</CardDescription>
          <Button asChild className="mt-6 rounded-full bg-amber-500 text-white hover:bg-amber-600"><Link href="/dashboard/create-wedding">Créer mon mariage</Link></Button>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {weddings.map((wedding) => {
            const busy = busyId === wedding.id
            return (
              <Card key={wedding.id} className="rounded-[2rem] bg-white shadow-sm">
                <CardHeader className="gap-3 border-b border-slate-100 px-6 py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl text-slate-900">{wedding.name}</CardTitle>
                      <CardDescription className="mt-1">{wedding.partnerOneName} & {wedding.partnerTwoName}</CardDescription>
                    </div>
                    <Badge className={`rounded-full ${statusClass(wedding.status)}`}>{statusLabel(wedding.status)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-amber-600" />{formatDate(wedding.weddingDate)}</span>
                    <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-slate-300" />{wedding.source === "local" ? "Mode démo local" : "Supabase"}</span>
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
                  {wedding.status === "published" ? <Button asChild variant="ghost" size="sm"><Link href={`/invitation/${wedding.slug}`} target="_blank"><ExternalLink className="size-4" /> Voir l’invitation</Link></Button> : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import WeddingForm from "@/components/wedding/WeddingForm"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { type WeddingFormValues } from "@/components/wedding/wedding-form-schema"
import { formValuesFromWeddingApi, getWedding, WeddingClientError } from "@/lib/weddings/client"
import { localFormValues, readLocalWeddings } from "@/lib/weddings/local-store"

export default function EditWeddingPage() {
  const params = useParams<{ weddingId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const weddingId = params.weddingId
  const [values, setValues] = useState<WeddingFormValues | null>(null)
  const [localMode, setLocalMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const localWedding = readLocalWeddings().find((wedding) => wedding.id === weddingId)
      if (localWedding) {
        if (active) {
          setValues(localFormValues(localWedding))
          setLocalMode(true)
          setLoading(false)
        }
        return
      }
      try {
        const row = await getWedding(weddingId)
        if (active) setValues(formValuesFromWeddingApi(row))
      } catch (error) {
        if (active) toast({ title: "Mariage introuvable", description: error instanceof WeddingClientError ? error.message : "Retournez à la liste des mariages.", variant: "error" })
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [toast, weddingId])

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6">
      <Button asChild variant="ghost" className="px-0 text-slate-600 hover:bg-transparent hover:text-slate-900">
        <Link href="/dashboard/weddings"><ArrowLeft className="size-4" /> Retour aux mariages</Link>
      </Button>
      {loading ? (
        <div className="flex items-center justify-center rounded-[2rem] bg-white p-16 text-slate-500"><Loader2 className="mr-3 size-5 animate-spin" /> Chargement…</div>
      ) : values ? (
        <>
          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Modifier un mariage</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Mettez à jour votre événement</h1>
          </section>
          <WeddingForm
            weddingId={weddingId}
            initialValues={values}
            localMode={localMode}
            onSaved={() => router.push("/dashboard/weddings")}
          />
        </>
      ) : (
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Ce mariage n’est pas disponible</h1>
          <Button asChild className="mt-5"><Link href="/dashboard/weddings">Retourner à la liste</Link></Button>
        </section>
      )}
    </main>
  )
}

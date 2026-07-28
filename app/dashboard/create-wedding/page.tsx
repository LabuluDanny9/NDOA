"use client"

import { useRouter } from "next/navigation"
import WeddingForm from "@/components/wedding/WeddingForm"

export default function CreateWeddingPage() {
  const router = useRouter()
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Créer un mariage</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Assistant de création de mariage</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Configurez toutes les informations de l’événement en 7 étapes, puis finalisez votre mariage.
          </p>
        </div>
      </section>

      <WeddingForm onSaved={() => router.push("/dashboard/weddings")} />
    </main>
  )
}

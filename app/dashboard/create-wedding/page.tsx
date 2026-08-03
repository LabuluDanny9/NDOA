"use client"

import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import WeddingForm from "@/components/wedding/WeddingForm"

export default function CreateWeddingPage() {
  const router = useRouter()
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="hero-glow mb-8 overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(245,158,11,0.78))] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-amber-200">
            <Sparkles className="size-4" />
            Creer un mariage
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Assistant de creation de mariage</h1>
          <p className="max-w-2xl text-base leading-7 text-blue-50/92">
            Configurez toutes les informations de l&apos;evenement en 7 etapes, puis finalisez votre mariage.
          </p>
        </div>
      </section>

      <WeddingForm onSaved={() => router.push("/dashboard/weddings")} />
    </main>
  )
}

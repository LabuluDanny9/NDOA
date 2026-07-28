"use client"

import { useEffect } from "react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Erreur inattendue
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          NDOA n’a pas pu afficher cette page
        </h1>
        <p className="mt-4 text-slate-600">
          Réessayez. Si le problème persiste, revenez à l’accueil.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 min-h-11 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Réessayer
        </button>
      </section>
    </main>
  )
}

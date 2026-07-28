import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          Erreur 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Page introuvable
        </h1>
        <p className="mt-4 text-slate-600">
          Cette adresse n’existe pas ou la page a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Retour à l’accueil
        </Link>
      </section>
    </main>
  )
}

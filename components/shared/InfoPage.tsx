import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface InfoPageProps {
  title: string
  description: string
  icon: LucideIcon
  backHref?: string
  backLabel?: string
}

export default function InfoPage({
  title,
  description,
  icon: Icon,
  backHref = "/",
  backLabel = "Retour à l’accueil",
}: InfoPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          NDOA
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 leading-7 text-slate-600">{description}</p>
        <Link
          href={backHref}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
        >
          {backLabel}
        </Link>
      </section>
    </main>
  )
}

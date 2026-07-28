import type { LucideIcon } from "lucide-react"

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
}

export default function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: ModulePlaceholderProps) {
  return (
    <section className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-dashed border-amber-300 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          Module planifié
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">{description}</p>
        <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Cette page réserve une route stable. Les données persistantes et les
          actions métier seront ajoutées dans une prochaine étape.
        </p>
      </div>
    </section>
  )
}

import Link from "next/link"
import { HeartHandshake, ShieldCheck } from "lucide-react"

interface AuthShellProps {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-amber-500 p-12 text-slate-950 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0 2px, transparent 2px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <Link
          href="/"
          className="relative inline-flex items-center gap-3 text-xl font-bold"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
            N
          </span>
          NDOA
        </Link>

        <div className="relative max-w-xl">
          <HeartHandshake className="size-12" aria-hidden="true" />
          <p className="mt-8 text-4xl font-semibold leading-tight">
            Organisez chaque détail. Profitez pleinement de votre mariage.
          </p>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-800">
            Un espace sécurisé pour votre équipe, vos invités et tous les
            moments qui comptent.
          </p>
        </div>

        <p className="relative flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="size-5" aria-hidden="true" />
          Sessions sécurisées et données isolées par mariage
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-3 text-lg font-bold text-slate-950 lg:hidden"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500">
              N
            </span>
            NDOA
          </Link>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Espace sécurisé
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

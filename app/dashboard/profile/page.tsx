import type { ComponentType } from "react"
import { CalendarDays, CircleUserRound, Mail, ShieldCheck } from "lucide-react"
import { getCurrentViewer, getRoleLabel } from "@/lib/auth/current-user"

export default async function ProfilePage() {
  const viewer = await getCurrentViewer()
  const initials = (viewer?.name ?? "Mode démonstration")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-blue-100">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Mon profil</p>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex size-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-500 text-3xl font-semibold text-white shadow-lg shadow-blue-950/20">
            {initials || "N"}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{viewer?.name ?? "Mode démonstration"}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {viewer ? getRoleLabel(viewer.role) : "Données locales sans session Supabase active"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ProfileCard icon={CircleUserRound} label="Identifiant" value={viewer?.id ?? "Session locale"} />
        <ProfileCard icon={Mail} label="Email" value={viewer?.email ?? "Non connecté"} />
        <ProfileCard icon={ShieldCheck} label="Rôle" value={viewer ? getRoleLabel(viewer.role) : "Démo"} />
      </section>

      <section className="rounded-[2rem] border border-blue-100 bg-blue-700 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-amber-200" />
          <h2 className="text-xl font-semibold">Espace organisateur</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-blue-50">
          Ce profil sert à gérer les mariages, les invités, les tables, la galerie et les RSVP. Les droits sont protégés par Supabase dès que la session est active.
        </p>
      </section>
    </main>
  )
}

function ProfileCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="size-5 text-amber-500" />
      </div>
      <p className="mt-4 break-words text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}

import type { ComponentType } from "react"
import { CalendarDays, CircleUserRound, Mail, ShieldCheck, Sparkles } from "lucide-react"
import { getCurrentViewer, getRoleLabel } from "@/lib/auth/current-user"

export default async function ProfilePage() {
  const viewer = await getCurrentViewer()
  const initials = (viewer?.name ?? "Mode demonstration")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <main className="space-y-8">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(245,158,11,0.78))] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
          <Sparkles className="size-4" />
          Mon profil
        </p>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="hero-glow flex size-24 items-center justify-center rounded-[2rem] bg-white/12 text-3xl font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
            {initials || "N"}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">{viewer?.name ?? "Mode demonstration"}</h1>
            <p className="mt-2 text-sm text-blue-50/90">
              {viewer ? getRoleLabel(viewer.role) : "Donnees locales sans session Supabase active"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ProfileCard icon={CircleUserRound} label="Identifiant" value={viewer?.id ?? "Session locale"} />
        <ProfileCard icon={Mail} label="Email" value={viewer?.email ?? "Non connecte"} />
        <ProfileCard icon={ShieldCheck} label="Role" value={viewer ? getRoleLabel(viewer.role) : "Demo"} />
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shadow-inner shadow-amber-100">
            <CalendarDays className="size-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-950">Espace organisateur</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Ce profil sert a gerer les mariages, les invites, les tables, la galerie et les RSVP. Les droits sont proteges par Supabase des qu&apos;une session est active.
        </p>
      </section>
    </main>
  )
}

function ProfileCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="size-5 text-amber-500" />
      </div>
      <p className="mt-4 break-words text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}

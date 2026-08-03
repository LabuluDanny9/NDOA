"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, CalendarClock, CheckCircle2, Clock3, HelpCircle, Send, Sparkles, Users } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"
import { loadDashboardData, type DashboardData } from "@/lib/dashboard/client"

const emptyDashboard: DashboardData = {
  weddingCount: 0,
  weddingId: null,
  weddingName: null,
  weddingDate: null,
  daysToWedding: null,
  guests: { total: 0, accepted: 0, declined: 0, pending: 0, maybe: 0 },
  upcomingEvents: [],
  activities: [],
  notifications: [],
  source: "local",
}

export default function StatsPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboard)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    loadDashboardData()
      .then((value) => {
        if (mounted) setData(value)
      })
      .catch(() => {
        if (mounted) setData(emptyDashboard)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const responseRate = useMemo(() => {
    if (!data.guests.total) return 0
    return Math.round(((data.guests.accepted + data.guests.declined + data.guests.maybe) / data.guests.total) * 100)
  }, [data.guests])

  const cards = [
    { label: "Invites", value: data.guests.total, icon: Users, tone: "text-blue-700 bg-blue-50" },
    { label: "Confirmes", value: data.guests.accepted, icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" },
    { label: "En attente", value: data.guests.pending, icon: Clock3, tone: "text-amber-700 bg-amber-50" },
    { label: "Taux de reponse", value: `${responseRate}%`, icon: Send, tone: "text-violet-700 bg-violet-50" },
    { label: "Peut-etre", value: data.guests.maybe, icon: HelpCircle, tone: "text-cyan-700 bg-cyan-50" },
    { label: "Jours restants", value: data.daysToWedding ?? "-", icon: CalendarClock, tone: "text-rose-700 bg-rose-50" },
  ]

  return (
    <main className="space-y-8">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(30,64,175,0.96),rgba(37,99,235,0.88),rgba(14,165,233,0.84))] p-8 text-white shadow-xl shadow-blue-950/20">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
          <Sparkles className="size-4" />
          Statistiques
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Pilotage des donnees reelles</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">
          Les chiffres affiches correspondent au mariage selectionne : {data.weddingName ?? "aucun mariage selectionne"}.
          Aucun invite ou table de demonstration n&apos;est ajoute automatiquement.
        </p>
        <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-50">
          Source : {data.source === "api" ? "Supabase connecte" : "Donnees locales reellement enregistrees"}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="surface-card p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">{card.label}</p>
                <span className={`rounded-2xl p-2 shadow-inner ${card.tone}`}>
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{loading ? "..." : card.value}</p>
            </div>
          )
        })}
      </section>

      <DashboardCharts data={data.guests} />

      <section className="surface-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shadow-inner shadow-amber-100">
            <Activity className="size-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-950">Dernieres actions</h2>
        </div>
        <div className="mt-5 divide-y divide-blue-50">
          {data.activities.length ? data.activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between gap-4 py-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">{activity.entity_type}</p>
                <p className="text-slate-500">{activity.action}</p>
              </div>
              <time className="text-slate-400">{new Date(activity.occurred_at).toLocaleString("fr-FR")}</time>
            </div>
          )) : (
            <p className="py-6 text-sm text-slate-500">Aucune activite recente a afficher pour ce mariage.</p>
          )}
        </div>
      </section>
    </main>
  )
}

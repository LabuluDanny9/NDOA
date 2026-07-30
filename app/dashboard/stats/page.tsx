"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, CheckCircle2, Clock3, HelpCircle, Send, Users } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"
import { loadDashboardData, type DashboardData } from "@/lib/dashboard/client"

const emptyDashboard: DashboardData = {
  weddingCount: 0,
  weddingId: null,
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
    { label: "Invités", value: data.guests.total, icon: Users },
    { label: "Confirmés", value: data.guests.accepted, icon: CheckCircle2 },
    { label: "En attente", value: data.guests.pending, icon: Clock3 },
    { label: "Taux de réponse", value: `${responseRate}%`, icon: Send },
    { label: "Peut-être", value: data.guests.maybe, icon: HelpCircle },
  ]

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 p-8 text-white shadow-xl shadow-blue-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Statistiques</p>
        <h1 className="mt-3 text-3xl font-semibold">Pilotage complet des RSVP</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">
          Suivez les confirmations, les refus, les invités en attente et les prochaines actions à relancer.
        </p>
        <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-50">
          Source : {data.source === "api" ? "Supabase connecté" : "mode local / démonstration"}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">{card.label}</p>
                <span className="rounded-2xl bg-blue-50 p-2 text-blue-700">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{loading ? "…" : card.value}</p>
            </div>
          )
        })}
      </section>

      <DashboardCharts data={data.guests} />

      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Activity className="size-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-slate-950">Dernières actions</h2>
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
            <p className="py-6 text-sm text-slate-500">Aucune activité récente à afficher pour le moment.</p>
          )}
        </div>
      </section>
    </main>
  )
}

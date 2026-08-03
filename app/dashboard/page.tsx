"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, CalendarClock, CalendarDays, CheckCircle2, Clock3, HeartHandshake, Send, Sparkles, Users } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"
import QuickActions, { type QuickAction } from "@/components/dashboard/QuickActions"
import StatCard from "@/components/dashboard/StatCard"
import { Button } from "@/components/ui/button"
import { loadDashboardData, type DashboardData } from "@/lib/dashboard/client"

const quickActions: QuickAction[] = [
  { title: "Nouveau mariage", description: "Creer un nouvel evenement.", icon: HeartHandshake, href: "/dashboard/create-wedding" },
  { title: "Ajouter des invites", description: "Importer ou ajouter vos invites.", icon: Users, href: "/dashboard/guests" },
  { title: "Envoyer les invitations", description: "Partager les invitations.", icon: Send, href: "/dashboard/invitations" },
  { title: "Suivre les statistiques", description: "Consulter les reponses RSVP.", icon: CalendarDays, href: "/dashboard/stats" },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboardData().then(setData) }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  if (!data) {
    return <main className="surface-card mx-auto max-w-7xl p-12 text-center text-slate-500">Chargement des indicateurs...</main>
  }

  const stats = [
    { title: "Total mariages", value: data.weddingCount, description: "Mariages reellement crees dans votre espace.", icon: HeartHandshake, color: "gold" as const },
    { title: "Invites", value: data.guests.total, description: "Invites reellement ajoutes au mariage selectionne.", icon: Users, color: "blue" as const },
    { title: "Presents", value: data.guests.accepted, description: "Reponses RSVP positives.", icon: CheckCircle2, color: "green" as const },
    { title: "Absents", value: data.guests.declined, description: "Reponses RSVP negatives.", icon: Clock3, color: "red" as const },
    { title: "Jours restants", value: data.daysToWedding ?? "-", description: data.weddingDate ? "Calcule depuis la date du mariage." : "Ajoutez une date de mariage.", icon: CalendarClock, color: "purple" as const },
  ]

  return (
    <main className="mx-auto grid max-w-7xl gap-6">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(29,78,216,0.88),rgba(30,64,175,0.88))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-amber-200">
              <Sparkles className="size-4" />
              Tableau de bord
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Vue premium et reelle de votre mariage</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50/92">
              Les indicateurs affiches correspondent a {data.weddingName ?? "aucun mariage selectionne"}.
              Les anciennes donnees de demonstration ne sont plus injectees automatiquement.
            </p>
          </div>

          <div className="surface-card-dark max-w-xl rounded-[1.75rem] p-5 text-sm text-blue-50/92">
            <p className="font-medium text-white">Source des donnees</p>
            <p className="mt-2">
              {data.source === "api" ? "Supabase connecte" : "Donnees locales reellement enregistrees"}.
              {data.weddingDate ? ` Date du mariage : ${new Date(`${data.weddingDate}T00:00:00`).toLocaleDateString("fr-FR", { dateStyle: "long" })}.` : " Aucune date de mariage definie."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </section>

      {data.weddingCount === 0 ? (
        <section className="surface-card mx-auto border border-dashed border-blue-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-950">Aucun mariage reel pour le moment</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Creez un mariage, ajoutez vos invites, puis les compteurs RSVP et le compte a rebours se mettront a jour automatiquement.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/create-wedding">Creer mon premier mariage</Link>
          </Button>
        </section>
      ) : null}

      <DashboardCharts data={data.guests} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Planning</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Prochains temps forts</h2>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shadow-inner shadow-amber-100">
              <CalendarDays className="size-6" />
            </div>
          </div>
          {data.upcomingEvents.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Ajoutez les evenements reels du mariage pour voir le calendrier ici.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {data.upcomingEvents.map((event) => (
                <div key={event.id} className="interactive-lift rounded-2xl border border-slate-100 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.venue_name ?? event.city ?? "Lieu a confirmer"}</p>
                    </div>
                    <time className="text-sm text-slate-600">{new Date(event.starts_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Notifications</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">A surveiller</h2>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600 shadow-inner shadow-sky-100">
              <Bell className="size-6" />
            </div>
          </div>
          {data.notifications.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucune notification non lue pour ce mariage.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {data.notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                  <p className="font-medium text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{notification.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <QuickActions actions={quickActions} />
        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Activite</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Dernieres actions</h2>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shadow-inner shadow-emerald-100">
              <CheckCircle2 className="size-6" />
            </div>
          </div>
          {data.activities.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500">Les actions reelles apparaitront ici.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {data.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm">
                  <span className="text-slate-700">{activity.entity_type} · {activity.action}</span>
                  <time className="text-xs text-slate-400">{new Date(activity.occurred_at).toLocaleDateString("fr-FR")}</time>
                </div>
              ))}
            </div>
          )}
          <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/dashboard/stats">Voir toutes les statistiques</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

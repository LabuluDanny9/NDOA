"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, CalendarClock, CalendarDays, CheckCircle2, Clock3, HeartHandshake, Send, Users } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"
import QuickActions, { type QuickAction } from "@/components/dashboard/QuickActions"
import StatCard from "@/components/dashboard/StatCard"
import { Button } from "@/components/ui/button"
import { loadDashboardData, type DashboardData } from "@/lib/dashboard/client"

const quickActions: QuickAction[] = [
  { title: "Nouveau mariage", description: "Créer un nouvel événement.", icon: HeartHandshake, href: "/dashboard/create-wedding" },
  { title: "Ajouter des invités", description: "Importer ou ajouter vos invités.", icon: Users, href: "/dashboard/guests" },
  { title: "Envoyer les invitations", description: "Partager les invitations.", icon: Send, href: "/dashboard/invitations" },
  { title: "Suivre les statistiques", description: "Consulter les réponses RSVP.", icon: CalendarDays, href: "/dashboard/stats" },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboardData().then(setData) }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  if (!data) {
    return <main className="mx-auto max-w-7xl rounded-[2rem] bg-white p-12 text-center text-slate-500">Chargement des indicateurs…</main>
  }

  const stats = [
    { title: "Total mariages", value: data.weddingCount, description: "Mariages réellement créés dans votre espace.", icon: HeartHandshake, color: "gold" as const },
    { title: "Invités", value: data.guests.total, description: "Invités réellement ajoutés au mariage sélectionné.", icon: Users, color: "blue" as const },
    { title: "Présents", value: data.guests.accepted, description: "Réponses RSVP positives.", icon: CheckCircle2, color: "green" as const },
    { title: "Absents", value: data.guests.declined, description: "Réponses RSVP négatives.", icon: Clock3, color: "red" as const },
    { title: "Jours restants", value: data.daysToWedding ?? "—", description: data.weddingDate ? "Calculé depuis la date du mariage." : "Ajoutez une date de mariage.", icon: CalendarClock, color: "purple" as const },
  ]

  return (
    <main className="mx-auto grid max-w-7xl gap-6">
      <section className="space-y-5 rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Tableau de bord</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Vue réelle du mariage</h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Les indicateurs affichés correspondent à {data.weddingName ?? "aucun mariage sélectionné"}.
            Les anciennes données de démonstration ne sont plus injectées automatiquement.
          </p>
        </div>
        <div className="rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
          Source : {data.source === "api" ? "Supabase connecté" : "données locales réellement enregistrées"}.
          {data.weddingDate ? ` Date du mariage : ${new Date(`${data.weddingDate}T00:00:00`).toLocaleDateString("fr-FR", { dateStyle: "long" })}.` : " Aucune date de mariage définie."}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>
      </section>

      {data.weddingCount === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Aucun mariage réel pour le moment</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Créez un mariage, ajoutez vos invités, puis les compteurs RSVP et le compte à rebours se mettront à jour automatiquement.
          </p>
          <Button asChild className="mt-6 bg-blue-700 text-white hover:bg-blue-800">
            <Link href="/dashboard/create-wedding">Créer mon premier mariage</Link>
          </Button>
        </section>
      ) : null}

      <DashboardCharts data={data.guests} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Planning</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Prochains temps forts</h2>
            </div>
            <CalendarDays className="size-6 text-amber-500" />
          </div>
          {data.upcomingEvents.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Ajoutez les événements réels du mariage pour voir le calendrier ici.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {data.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.venue_name ?? event.city ?? "Lieu à confirmer"}</p>
                  </div>
                  <time className="text-sm text-slate-600">{new Date(event.starts_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Notifications</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">À surveiller</h2>
            </div>
            <Bell className="size-6 text-sky-500" />
          </div>
          {data.notifications.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucune notification non lue pour ce mariage.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {data.notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-slate-100 p-4">
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
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Activité</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Dernières actions</h2>
            </div>
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          {data.activities.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500">Les actions réelles apparaîtront ici.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {data.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
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

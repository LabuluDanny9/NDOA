"use client"

import { ChartLine, Users, CheckCircle2, Clock3, HeartHandshake, Send } from "lucide-react"
import Activity, { ActivityItem } from "@/components/dashboard/Activity"
import EmptyState from "@/components/dashboard/EmptyState"
import QuickActions, { QuickAction } from "@/components/dashboard/QuickActions"
import StatCard from "@/components/dashboard/StatCard"
import WeddingCard from "@/components/dashboard/WeddingCard"

const statCards = [
  {
    title: "Total mariages",
    value: 2,
    description: "Événements actifs dans votre espace.",
    icon: HeartHandshake,
    color: "gold" as const,
  },
  {
    title: "Invités",
    value: 248,
    description: "Invités ajoutés au total.",
    icon: Users,
    color: "blue" as const,
  },
  {
    title: "Présents",
    value: 180,
    description: "Invités ayant confirmé leur présence.",
    icon: CheckCircle2,
    color: "green" as const,
  },
  {
    title: "En attente",
    value: 55,
    description: "Invitations en attente de réponse.",
    icon: Clock3,
    color: "red" as const,
  },
]

const weddingCards = [
  {
    id: "danny-abigail",
    coverImage: "/images/wedding-1.jpg",
    groomName: "Danny",
    brideName: "Abigail",
    weddingDate: "12 Août 2027",
    location: "Lubumbashi",
    totalGuests: 120,
    confirmedGuests: 95,
    pendingGuests: 20,
    declinedGuests: 5,
    countdown: "45",
  },
  {
    id: "kevin-grace",
    coverImage: "/images/wedding-2.jpg",
    groomName: "Kevin",
    brideName: "Grâce",
    weddingDate: "03 Septembre 2027",
    location: "Kolwezi",
    totalGuests: 128,
    confirmedGuests: 85,
    pendingGuests: 32,
    declinedGuests: 11,
    countdown: "67",
  },
]

const quickActions: QuickAction[] = [
  {
    title: "Nouveau mariage",
    description: "Créer un nouvel événement.",
    icon: HeartHandshake,
    href: "/dashboard/create-wedding",
  },
  {
    title: "Ajouter des invités",
    description: "Importer ou ajouter vos invités.",
    icon: Users,
    href: "/dashboard/guests",
  },
  {
    title: "Envoyer les invitations",
    description: "Partager les invitations.",
    icon: Send,
    href: "/dashboard/invitations",
  },
  {
    title: "Suivre les statistiques",
    description: "Consulter les réponses RSVP.",
    icon: ChartLine,
    href: "/dashboard/stats",
  },
]

const activityItems: ActivityItem[] = [
  {
    id: 1,
    icon: CheckCircle2,
    title: "95 invités ont confirmé leur présence.",
    time: "Il y a 3 minutes",
    color: "text-emerald-600",
  },
  {
    id: 2,
    icon: Send,
    title: "Invitation envoyée à 34 nouveaux invités.",
    time: "Il y a 15 minutes",
    color: "text-amber-600",
  },
  {
    id: 3,
    icon: Clock3,
    title: "11 invitations restent en attente.",
    time: "Il y a 45 minutes",
    color: "text-sky-600",
  },
]

export default function DashboardPage() {
  const hasWeddings = weddingCards.length > 0

  return (
    <main className="mx-auto grid max-w-7xl gap-6">
      <section className="space-y-3 rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Tableau de bord</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Vue globale</h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Découvrez les indicateurs clés de vos mariages et accédez rapidement aux actions essentielles.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Mes mariages</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">Événements en cours</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-600">
              Gérez chaque mariage avec une vue claire sur les invités, le lieu et l’avancement.
            </p>
          </div>
        </div>

        {hasWeddings ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {weddingCards.map((wedding) => (
              <WeddingCard
                key={wedding.id}
                coverImage={wedding.coverImage}
                groomName={wedding.groomName}
                brideName={wedding.brideName}
                weddingDate={wedding.weddingDate}
                location={wedding.location}
                totalGuests={wedding.totalGuests}
                confirmedGuests={wedding.confirmedGuests}
                pendingGuests={wedding.pendingGuests}
                declinedGuests={wedding.declinedGuests}
                countdown={wedding.countdown}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <QuickActions actions={quickActions} />
        <Activity items={activityItems} />
      </section>
    </main>
  )
}

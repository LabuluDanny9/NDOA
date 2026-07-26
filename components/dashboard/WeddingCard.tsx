"use client"

import { motion } from "framer-motion"
import { Pencil, Share2, CheckCircle2, Clock, MapPin, Users, UserCheck, AlertCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface WeddingCardProps {
  coverImage: string
  groomName: string
  brideName: string
  weddingDate: string
  location: string
  totalGuests: number
  confirmedGuests: number
  pendingGuests: number
  declinedGuests: number
  countdown: string
}

export default function WeddingCard({
  coverImage,
  groomName,
  brideName,
  weddingDate,
  location,
  totalGuests,
  confirmedGuests,
  pendingGuests,
  declinedGuests,
  countdown,
}: WeddingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Card className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="relative">
          <img
            src={coverImage}
            alt={`${groomName} et ${brideName}`}
            className="h-64 w-full object-cover sm:h-72"
          />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
              À venir
            </span>
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl border-white/80 bg-white/90 text-foreground shadow-sm hover:border-amber-300"
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl border-white/80 bg-white/90 text-foreground shadow-sm hover:border-amber-300"
            >
              <Share2 className="size-5" />
            </Button>
          </div>
        </div>

        <CardContent className="space-y-6 px-6 py-6">
          <div className="space-y-3">
            <CardTitle className="text-2xl font-semibold text-foreground">
              {groomName} ❤️ {brideName}
            </CardTitle>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground sm:gap-5">
              <span className="inline-flex items-center gap-2 text-sm text-foreground">
                <Clock className="size-4 text-amber-600" />
                {weddingDate}
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-foreground">
                <MapPin className="size-4 text-sky-600" />
                {location}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="size-4 text-amber-600" />
                Invités
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totalGuests}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <UserCheck className="size-4 text-emerald-600" />
                Confirmés
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{confirmedGuests}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertCircle className="size-4 text-sky-600" />
                En attente
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{pendingGuests}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <XCircle className="size-4 text-rose-600" />
                Refus
              </div>
              <p className="mt-3 text-3xl font-semibold text-foreground">{declinedGuests}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-100 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 text-amber-600" />
              <span>J-{countdown}</span>
            </div>
            <Badge className="rounded-full bg-amber-100 text-amber-700">{countdown} jours</Badge>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" size="sm" className="w-full rounded-2xl border-gray-200 text-foreground hover:bg-gray-50">
              Voir
            </Button>
            <Button variant="outline" size="sm" className="w-full rounded-2xl border-gray-200 text-foreground hover:bg-gray-50">
              Statistiques
            </Button>
            <Button className="w-full rounded-2xl bg-amber-500 text-white hover:bg-amber-600" size="sm">
              Inviter
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Check,
  Image as Images,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const float = {
  animate: { y: [0, -8, 0], rotate: [0, 1, 0] },
  transition: { duration: 4, repeat: Infinity },
}

function FeatureItem({ Icon, children }: { Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </li>
  )
}

function useCountdown(target: Date) {
  const [diff, setDiff] = React.useState(() => Math.max(0, target.getTime() - Date.now()))

  React.useEffect(() => {
    const t = setInterval(() => {
      setDiff(Math.max(0, target.getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(t)
  }, [target])

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

export default function Demo() {
  // example target date for countdown
  const targetDate = React.useMemo(() => new Date("2027-08-12T15:00:00"), [])
  const { days, hours, minutes } = useCountdown(targetDate)

  return (
    <section id="demo" aria-label="Démonstration" className="bg-[#FAF8F5] py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          {/* Left column */}
          <div>
            <h3 className="font-heading text-2xl font-semibold">Découvrez votre invitation avant même de la créer.</h3>
            <p className="mt-4 text-muted-foreground">
              Vos invités recevront une invitation moderne, élégante et interactive accessible depuis leur téléphone. Ils pourront consulter toutes les informations du mariage et confirmer leur présence en quelques secondes.
            </p>

            <ul className="mt-6 grid gap-3 text-sm">
              <FeatureItem Icon={Images}>Photos du couple avant le mariage</FeatureItem>
              <FeatureItem Icon={Calendar}>Programme de la cérémonie</FeatureItem>
              <FeatureItem Icon={Clock}>Compte à rebours</FeatureItem>
              <FeatureItem Icon={MapPin}>Google Maps</FeatureItem>
              <FeatureItem Icon={Check}>Confirmation RSVP</FeatureItem>
              <FeatureItem Icon={QrCode}>QR Code sécurisé</FeatureItem>
            </ul>

            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className={cn("bg-gradient-to-r from-amber-400 to-amber-600 text-white px-4 py-2 rounded-md shadow-md")}
                aria-label="Voir une invitation"
              >
                <Link href="/invitation/emma-louis">Voir une invitation</Link>
              </Button>
            </div>
          </div>

          {/* Right column: phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              className="relative"
              {...float}
            >
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-black/5 blur-lg" aria-hidden />

              <Card className="relative w-64 sm:w-72 md:w-80 rounded-3xl bg-white shadow-2xl ring-1 ring-black/8 overflow-hidden">
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/hero.jpg"
                    alt="Romantic couple"
                    width={640}
                    height={360}
                    priority
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 flex h-12 items-center justify-center bg-black/20 text-white">
                    <span className="text-xs uppercase tracking-[0.2em]">Invitation mobile</span>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Emma & Louis</p>
                      <p className="text-xs text-muted-foreground">12 août 2027 • 15:00</p>
                    </div>
                    <Badge variant="secondary">Invité</Badge>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <div className="rounded-2xl bg-slate-100 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Compte à rebours</p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-2xl bg-white p-2 shadow-sm">
                          <p className="font-semibold">{days}</p>
                          <span className="text-[10px] text-muted-foreground">Jours</span>
                        </div>
                        <div className="rounded-2xl bg-white p-2 shadow-sm">
                          <p className="font-semibold">{hours}</p>
                          <span className="text-[10px] text-muted-foreground">Heures</span>
                        </div>
                        <div className="rounded-2xl bg-white p-2 shadow-sm">
                          <p className="font-semibold">{minutes}</p>
                          <span className="text-[10px] text-muted-foreground">Min</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-amber-500 text-white hover:bg-amber-600">Confirmer ma présence</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

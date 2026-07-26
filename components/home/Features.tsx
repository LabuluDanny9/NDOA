"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Mail,
  CheckCircle,
  Image as Images,
  MapPin,
  LayoutDashboard,
  QrCode,
} from "lucide-react"

import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
}

type Feature = {
  id: string
  title: string
  description: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const FEATURES: Feature[] = [
  {
    id: "invitation",
    title: "Invitation numérique",
    description: "Créez des invitations élégantes accessibles depuis un simple lien.",
    Icon: Mail,
  },
  {
    id: "rsvp",
    title: "RSVP intelligent",
    description: "Suivez automatiquement les confirmations, refus et réponses en attente.",
    Icon: CheckCircle,
  },
  {
    id: "gallery",
    title: "Galerie du couple",
    description: "Présentez vos plus belles photos prises avant le mariage dans une galerie élégante.",
    Icon: Images,
  },
  {
    id: "location",
    title: "Localisation",
    description: "Partagez l'adresse de la cérémonie avec Google Maps.",
    Icon: MapPin,
  },
  {
    id: "dashboard",
    title: "Tableau de bord",
    description: "Consultez les statistiques de vos invités en temps réel.",
    Icon: LayoutDashboard,
  },
  {
    id: "qrcode",
    title: "QR Code sécurisé",
    description: "Générez un QR Code unique pour chaque invité afin de faciliter l'accès à l'événement.",
    Icon: QrCode,
  },
]

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ translateY: -8 }}
      className="rounded-xl"
    >
      <Card className={cn("h-full border-transparent transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg")}> 
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
                <feature.Icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">{feature.description}</CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="features" className="bg-white py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-semibold">Tout ce dont vous avez besoin pour organiser votre mariage</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            NDOA simplifie la gestion de vos invitations, de la création jusqu'à la confirmation des invités.
          </p>
        </div>

        <motion.div
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

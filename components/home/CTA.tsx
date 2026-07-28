"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

const features = [
  "Sans installation",
  "Configuration en quelques minutes",
  "Partage par lien ou QR Code",
]

export default function CTA() {
  return (
    <motion.section
      id="start"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-white via-amber-50 to-amber-100/80 px-6 py-10 shadow-[0_30px_80px_rgba(245,210,119,0.16)] sm:px-10 lg:px-14"
      variants={fadeIn}
    >
      <div className="text-center">
        <Badge variant="secondary" className="mx-auto mb-4 bg-amber-100 text-amber-700 border-transparent">
          Commencez gratuitement
        </Badge>

        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Votre mariage mérite une invitation exceptionnelle.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Créez une invitation numérique élégante, gérez facilement vos invités et suivez les confirmations en temps réel avec NDOA.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          size="lg"
          className={cn(
            "rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20",
            "hover:from-amber-500 hover:to-amber-700"
          )}
        >
          <Link href="/register">Créer mon mariage</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-foreground">
          <Link href="#demo">Voir une démonstration</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center justify-center gap-2 rounded-3xl border border-amber-200/80 bg-white/80 py-3 px-4 text-sm text-foreground shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

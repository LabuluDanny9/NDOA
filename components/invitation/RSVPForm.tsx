"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function RSVPForm() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">RSVP</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Répondez en ligne</h2>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">Rapide</div>
      </div>

      {submitted ? (
        <div className="mt-10 rounded-[1.75rem] bg-emerald-500/10 p-6 text-emerald-100">
          <div className="flex items-center gap-3 text-xl font-semibold text-emerald-100">
            <Check className="h-5 w-5 text-emerald-300" /> Merci pour votre réponse !
          </div>
          <p className="mt-3 text-sm text-slate-200/80">Nous avons bien enregistré votre présence. Hâte de vous accueillir.</p>
        </div>
      ) : (
        <form className="mt-8 grid gap-4">
          <Input placeholder="Nom complet" />
          <Input placeholder="Téléphone" />
          <Input placeholder="Email" type="email" />
          <div className="grid gap-4 sm:grid-cols-2">
            <select className="input w-full rounded-3xl bg-slate-950/80 border border-white/10 px-4 py-2 text-white">
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="maybe">Peut-être</option>
            </select>
            <Input placeholder="Nombre d'accompagnants" type="number" />
          </div>
          <Textarea placeholder="Message pour les mariés" className="h-28" />
          <Button type="button" onClick={() => setSubmitted(true)}>Envoyer ma réponse</Button>
        </form>
      )}
    </motion.section>
  )
}

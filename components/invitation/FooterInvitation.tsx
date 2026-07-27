"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function FooterInvitation({ couple }: { couple: { bride: string; groom: string } }) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Remerciement</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Merci de partager ce moment avec nous</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Votre présence rendra ce jour encore plus précieux. Nous avons hâte de vous accueillir et de célébrer ensemble.</p>
        <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-slate-950/80 px-6 py-3 text-slate-200 shadow-inner shadow-black/30">
          <Heart className="h-5 w-5 text-primary" />
          <span>{couple.groom} &amp; {couple.bride}</span>
        </div>
      </div>
    </motion.footer>
  )
}

"use client"

import { motion } from "framer-motion"
import { HeartHandshake } from "lucide-react"

export default function HeroInvitation({ couple }: { couple: { bride: string; groom: string; tagline: string; date: string; location: string } }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(163,132,255,0.16),_transparent_30%)]" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/80 shadow-sm shadow-white/5">
            <HeartHandshake className="h-4 w-4" /> Invitation digitale premium
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {couple.groom} & <span className="text-primary">{couple.bride}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-200/90">{couple.tagline}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-5 shadow-lg shadow-black/20">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Date</p>
              <p className="mt-2 text-xl font-medium text-white">{new Date(couple.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5 shadow-lg shadow-black/20">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lieu</p>
              <p className="mt-2 text-xl font-medium text-white">{couple.location}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Invitation</p>
              <p className="text-3xl font-semibold text-white">Réservez votre présence</p>
              <p className="text-sm leading-6 text-slate-300">Une expérience digitale raffinée pour partager votre présence, les directions GPS et les plus belles photos.</p>
            </div>
            <div className="grid gap-3 rounded-[1.5rem] bg-slate-950/90 p-5 text-slate-200 shadow-inner shadow-slate-900/60">
              <div className="flex items-center justify-between text-sm text-slate-400"><span>Mode</span><span>Ouvrir le livre</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary to-secondary" />
              </div>
              <div className="text-xs uppercase tracking-[0.33em] text-slate-500">Expérience</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

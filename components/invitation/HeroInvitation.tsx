"use client"

import { motion } from "framer-motion"
import { CalendarDays, HeartHandshake, MapPin } from "lucide-react"

export default function HeroInvitation({ couple }: { couple: { bride: string; groom: string; tagline: string; date: string; location: string } }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-7 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-9"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.28),_transparent_32%)]" />
      <div className="relative z-10 space-y-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white shadow-sm shadow-blue-950/10">
          <HeartHandshake className="h-4 w-4 text-amber-300" />
          Invitation digitale
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
            {couple.groom} & <span className="text-amber-300">{couple.bride}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-blue-50">{couple.tagline}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/20 bg-white/95 p-5 text-slate-950 shadow-lg shadow-blue-950/20">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-700">
              <CalendarDays className="h-4 w-4" />
              Date
            </p>
            <p className="mt-2 text-lg font-semibold">
              {new Date(couple.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/95 p-5 text-slate-950 shadow-lg shadow-blue-950/20">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-700">
              <MapPin className="h-4 w-4" />
              Lieu
            </p>
            <p className="mt-2 text-lg font-semibold">{couple.location}</p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

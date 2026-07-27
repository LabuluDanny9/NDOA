"use client"

import { motion } from "framer-motion"
import { Gift } from "lucide-react"

export default function GiftSection({ gifts }: { gifts: Array<{ title: string; description: string }> }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Cadeaux</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Contribuez à notre rêve</h2>
        </div>
        <Gift className="h-7 w-7 text-secondary" />
      </div>
      <div className="mt-8 space-y-4">
        {gifts.map((gift) => (
          <div key={gift.title} className="rounded-[1.75rem] bg-slate-950/80 p-5 shadow-inner shadow-black/30">
            <h3 className="text-xl font-semibold text-white">{gift.title}</h3>
            <p className="mt-2 text-slate-300">{gift.description}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

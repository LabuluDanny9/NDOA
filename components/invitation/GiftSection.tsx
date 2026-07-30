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
      className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-950/5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-700">Cadeaux</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Contribuez à notre rêve</h2>
        </div>
        <Gift className="h-7 w-7 text-amber-500" />
      </div>
      <div className="mt-8 space-y-4">
        {gifts.map((gift) => (
          <div key={gift.title} className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-5">
            <h3 className="text-xl font-semibold text-slate-950">{gift.title}</h3>
            <p className="mt-2 text-slate-600">{gift.description}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

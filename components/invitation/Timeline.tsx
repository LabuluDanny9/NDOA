"use client"

import { motion } from "framer-motion"

export default function Timeline({ items }: { items: Array<{ time: string; title: string; description: string }> }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Programme</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">La journée</h2>
        </div>
        <div className="rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm text-secondary">Moment clé</div>
      </div>
      <div className="mt-10 space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.time}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.35em] text-slate-300">{item.time}</span>
              <span className="text-sm text-slate-400">Étape {index + 1}</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-slate-300">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

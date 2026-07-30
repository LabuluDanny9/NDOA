"use client"

import { motion } from "framer-motion"

export default function Timeline({ items }: { items: Array<{ time: string; title: string; description: string }> }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-950/5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-700">Programme</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">La journée</h2>
        </div>
        <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Moment clé
        </div>
      </div>
      <div className="mt-10 space-y-5">
        {items.map((item, index) => (
          <motion.div
            key={`${item.time}-${item.title}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="grid gap-4 rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-blue-700 px-4 py-2 text-sm uppercase tracking-[0.35em] text-white">{item.time}</span>
              <span className="text-sm text-slate-500">Étape {index + 1}</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-slate-600">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

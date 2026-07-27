"use client"

import { motion } from "framer-motion"
import { QrCode } from "lucide-react"

export default function QRCodeCard({ url, code }: { url: string; code: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">QR Code</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Accès instantané</h2>
        </div>
        <QrCode className="h-7 w-7 text-secondary" />
      </div>
      <div className="mt-8 grid gap-4 rounded-[2rem] bg-slate-950/80 p-6 text-center text-slate-200">
        <div className="mx-auto h-40 w-40 rounded-3xl bg-white/10 p-6 text-slate-200">
          <div className="h-full w-full rounded-2xl bg-white/80" />
        </div>
        <p className="text-sm text-slate-400">Scanner ce code pour accéder directement à l'invitation.</p>
        <p className="rounded-full bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">Code: {code}</p>
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate))

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => window.clearInterval(timer)
  }, [targetDate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Compte à rebours jusqu'au jour J</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {timeLeft.map((segment) => (
          <div key={segment.label} className="rounded-3xl bg-slate-950/80 p-5 text-center">
            <p className="text-4xl font-semibold text-white">{segment.value}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.35em] text-slate-400">{segment.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function getTimeLeft(targetDate: string) {
  const diff = Math.max(new Date(targetDate).getTime() - Date.now(), 0)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return [
    { label: "Jours", value: String(days).padStart(2, "0") },
    { label: "Heures", value: String(hours).padStart(2, "0") },
    { label: "Minutes", value: String(minutes).padStart(2, "0") },
    { label: "Secondes", value: String(seconds).padStart(2, "0") },
  ]
}

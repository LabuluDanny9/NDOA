"use client"

import { motion } from "framer-motion"
import { MapPin, ExternalLink } from "lucide-react"

export default function LocationMap({ location, address }: { location: string; address: string }) {
  const query = encodeURIComponent(address)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Lieu</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{location}</h2>
        </div>
        <MapPin className="h-7 w-7 text-primary" />
      </div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
        <iframe
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          className="h-72 w-full border-0"
          loading="lazy"
          title="Carte du lieu"
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] bg-slate-950/80 p-5 text-slate-300">
        <p>{address}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Navigation GPS <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.section>
  )
}

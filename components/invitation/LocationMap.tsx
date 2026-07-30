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
      id="location"
      className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-950/5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-700">Lieu</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">{location}</h2>
        </div>
        <MapPin className="h-7 w-7 text-amber-500" />
      </div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-blue-100 bg-blue-50">
        <iframe
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          className="h-72 w-full border-0"
          loading="lazy"
          title="Carte du lieu"
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] bg-blue-50 p-5 text-slate-700">
        <p>{address}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
        >
          Navigation GPS <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.section>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MusicPlayer({ track }: { track: { title: string; artist: string; source: string } }) {
  const [playing, setPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Ambiance musicale</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{track.title}</h2>
          <p className="mt-2 text-slate-300">{track.artist}</p>
        </div>
        <Music2 className="h-7 w-7 text-secondary" />
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
        <audio src={track.source} autoPlay={playing} loop className="hidden" />
        <div className="space-y-1">
          <p className="text-sm text-slate-400">Appuyez pour lancer</p>
          <p className="text-sm text-slate-300">Musique douce pour l’événement</p>
        </div>
        <Button variant="secondary" onClick={() => setPlaying((s) => !s)}>
          {playing ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {playing ? "Pause" : "Lecture"}
        </Button>
      </div>
    </motion.div>
  )
}

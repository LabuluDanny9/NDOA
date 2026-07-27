"use client"

import { motion } from "framer-motion"
import { MessageCircle, Share2, MapPin, Edit3 } from "lucide-react"

export default function FloatingMenu() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
    >
      <a href="#rsvp" aria-label="Aller au formulaire RSVP" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/20">
        <MessageCircle className="h-6 w-6" />
      </a>
      <a href="#gallery" aria-label="Aller à la galerie" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/20">
        <Share2 className="h-6 w-6" />
      </a>
      <a href="#location" aria-label="Aller au lieu du mariage" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/20">
        <MapPin className="h-6 w-6" />
      </a>
      <a href="#story" aria-label="Aller à l’histoire du couple" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/20">
        <Edit3 className="h-6 w-6" />
      </a>
    </motion.div>
  )
}

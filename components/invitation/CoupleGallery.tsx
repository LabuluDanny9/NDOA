"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function CoupleGallery({ images }: { images: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9 }}
      className="grid gap-6 lg:grid-cols-[1fr_0.6fr]"
    >
      <div className="relative min-h-96 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-inner shadow-black/20">
        <Image
          src={images[0]}
          alt="Le couple lors d’un moment précieux"
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 rounded-b-[2rem] bg-gradient-to-t from-slate-950/90 to-transparent p-6 text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Moments précieux</p>
          <p className="mt-3 text-2xl font-semibold">Leur histoire en images</p>
        </div>
      </div>
      <div className="grid gap-6">
        {images.slice(1).map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-48 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 shadow-lg shadow-black/20">
            <Image
              src={src}
              alt={`Souvenir du couple ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </motion.section>
  )
}

"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function PhotoGallery({ images }: { images: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      id="gallery"
      className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Galerie</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Moments inoubliables</h2>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {images.map((src, index) => (
          <motion.div key={`${src}-${index}`} className="relative h-64 overflow-hidden rounded-[1.75rem] bg-slate-950/80 shadow-inner shadow-black/30">
            <Image
              src={src}
              alt={`Souvenir du mariage ${index + 1}`}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

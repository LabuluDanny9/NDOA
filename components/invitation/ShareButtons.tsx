"use client"

import { Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ShareButtons({ url }: { url: string }) {
  function copyLink() {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Partager</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          <Copy className="h-4 w-4" /> Copier le lien
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          <img src="/whatsapp.png" alt="WhatsApp" className="h-5 w-5 object-contain" />
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          <img src="/facebook.png" alt="Facebook" className="h-5 w-5 object-contain" />
          Facebook
        </a>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
        <span>Envoyer sur X</span>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-2"><X className="h-4 w-4" /> Ouvrir</a>
      </div>
    </div>
  )
}

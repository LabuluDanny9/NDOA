"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { QrCode } from "lucide-react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"

export default function QRCodeCard({ url, code }: { url: string; code: string }) {
  const qrContainerRef = useRef<HTMLDivElement>(null)

  function downloadQrCode() {
    const svg = qrContainerRef.current?.querySelector("svg")
    if (!svg) return

    const source = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = downloadUrl
    anchor.download = `${code.toLowerCase()}-invitation.svg`
    anchor.click()
    URL.revokeObjectURL(downloadUrl)
  }

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
        <div ref={qrContainerRef} className="mx-auto rounded-3xl bg-white p-4">
          <QRCode value={url} size={144} aria-label={`QR code pour ${url}`} />
        </div>
        <p className="text-sm text-slate-400">Scannez ce code pour accéder directement à l’invitation.</p>
        <Button type="button" variant="secondary" onClick={downloadQrCode}>
          Télécharger le QR code
        </Button>
        <p className="rounded-full bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">Code: {code}</p>
      </div>
    </motion.div>
  )
}

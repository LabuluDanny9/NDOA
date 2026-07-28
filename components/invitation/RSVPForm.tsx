"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type RsvpResponse = "accepted" | "declined" | "maybe"

export default function RSVPForm({ slug = "demo" }: { slug?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const response = form.get("status") === "present" ? "accepted" : form.get("status") === "absent" ? "declined" : "maybe"
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      response: response as RsvpResponse,
      companionsCount: Math.max(0, Number(form.get("guestCount") ?? 0) || 0),
      comments: String(form.get("message") ?? ""),
    }
    try {
      if (slug !== "demo") {
        const result = await fetch(`/api/public/invitations/${encodeURIComponent(slug)}/rsvp`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!result.ok) {
          const body = await result.json().catch(() => null) as { error?: { code?: string; message?: string } } | null
          if (body?.error?.code !== "SUPABASE_NOT_CONFIGURED") throw new Error(body?.error?.message ?? "La réponse n’a pas pu être enregistrée.")
        }
      }
      if (typeof window !== "undefined") window.localStorage.setItem(`ndoa:rsvp:${slug}:${payload.email.toLowerCase()}`, JSON.stringify({ response: payload.response, submittedAt: new Date().toISOString() }))
      setSubmitted(true)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "La réponse n’a pas pu être enregistrée.")
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.section initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }} id="rsvp" className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-sm uppercase tracking-[0.35em] text-slate-400">RSVP</p><h2 className="mt-3 text-3xl font-semibold text-white">Répondez en ligne</h2></div>
        <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">Sécurisé</div>
      </div>
      {submitted ? (
        <div className="mt-10 rounded-[1.75rem] bg-emerald-500/10 p-6 text-emerald-100" role="status">
          <div className="flex items-center gap-3 text-xl font-semibold"><Check className="h-5 w-5 text-emerald-300" /> Merci pour votre réponse !</div>
          <p className="mt-3 text-sm text-slate-200/80">Votre réponse est enregistrée. Vous pouvez revenir ici pour la mettre à jour.</p>
        </div>
      ) : (
        <form className="mt-8 grid gap-4" onSubmit={submit}>
          <Input aria-label="Nom complet" name="fullName" placeholder="Nom complet" required minLength={2} />
          <Input aria-label="Email" name="email" placeholder="Email" type="email" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <select aria-label="Réponse RSVP" name="status" defaultValue="present" className="input w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-2 text-white">
              <option value="present">Présent</option><option value="absent">Absent</option><option value="maybe">Peut-être</option>
            </select>
            <Input aria-label="Nombre d’accompagnants" name="guestCount" placeholder="Nombre d’accompagnants" type="number" min={0} max={20} defaultValue={0} />
          </div>
          <Textarea aria-label="Message pour les mariés" name="message" placeholder="Message pour les mariés" className="h-28" maxLength={5000} />
          {error ? <p className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200" role="alert">{error}</p> : null}
          <Button type="submit" disabled={sending}>{sending ? <><Loader2 className="size-4 animate-spin" /> Envoi…</> : "Envoyer ma réponse"}</Button>
        </form>
      )}
    </motion.section>
  )
}

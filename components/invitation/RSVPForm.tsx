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
    const response =
      form.get("status") === "present"
        ? "accepted"
        : form.get("status") === "absent"
          ? "declined"
          : "maybe"
    const payload = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      response: response as RsvpResponse,
      comments: String(form.get("comments") ?? "").trim() || null,
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
          if (body?.error?.code !== "SUPABASE_NOT_CONFIGURED") {
            throw new Error(body?.error?.message ?? "La réponse n’a pas pu être enregistrée.")
          }
        }
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `ndoa:rsvp:${slug}:${payload.phone.replace(/[^\d+]/g, "")}`,
          JSON.stringify({ response: payload.response, submittedAt: new Date().toISOString() }),
        )
      }
      setSubmitted(true)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "La réponse n’a pas pu être enregistrée.")
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      id="rsvp"
      className="rounded-[2rem] border border-white/70 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-700">RSVP</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Confirmer l’invitation</h2>
          <p className="mt-2 text-sm text-slate-600">Prénom, nom, téléphone et un mot optionnel pour les mariés.</p>
        </div>
        <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
          Sécurisé
        </div>
      </div>
      {submitted ? (
        <div className="mt-8 rounded-[1.75rem] bg-emerald-50 p-6 text-emerald-900" role="status">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <Check className="h-5 w-5 text-emerald-600" />
            Merci pour votre réponse !
          </div>
          <p className="mt-3 text-sm text-emerald-800/80">
            Votre réponse est enregistrée. Vous pouvez revenir ici pour la mettre à jour.
          </p>
        </div>
      ) : (
        <form className="mt-8 grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input aria-label="Prénom" name="firstName" placeholder="Prénom" required minLength={2} />
            <Input aria-label="Nom" name="lastName" placeholder="Nom" required minLength={2} />
          </div>
          <Input aria-label="Numéro de téléphone" name="phone" placeholder="+243 ..." type="tel" required minLength={6} />
          <Textarea
            aria-label="Mot pour les mariés"
            name="comments"
            placeholder="Écrivez un petit mot pour les mariés…"
            maxLength={5000}
            className="rounded-xl border-blue-100 bg-white focus-visible:border-blue-400 focus-visible:ring-blue-100"
          />
          <select
            aria-label="Réponse RSVP"
            name="status"
            defaultValue="present"
            className="min-h-11 w-full rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="present">Présent</option>
            <option value="absent">Absent</option>
            <option value="maybe">Peut-être</option>
          </select>
          {error ? (
            <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={sending} className="bg-blue-700 text-white hover:bg-blue-800">
            {sending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Envoi…
              </>
            ) : (
              "Envoyer ma réponse"
            )}
          </Button>
        </form>
      )}
    </motion.section>
  )
}

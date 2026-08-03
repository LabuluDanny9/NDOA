"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { Clock3, Mail, MessageCircle, Send, Smartphone, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { fromGuestApiRow, GuestClientError, listGuests } from "@/lib/guests/client"
import { readLocalGuests } from "@/lib/guests/local-store"
import { listMessages, NotificationClientError, queueMessage, type MessageItem } from "@/lib/notifications/client"
import { readLocalMessages, saveLocalMessage } from "@/lib/notifications/local-store"
import { channelLabel, notificationTemplates, renderNotificationTemplate, type NotificationTemplateKey } from "@/lib/notifications/templates"
import { resolveActiveWedding } from "@/lib/weddings/active"
import type { Guest } from "@/components/guests/types"
import type { MessageChannel } from "@/types/database.types"

const channels: Array<{ value: MessageChannel; icon: typeof Mail }> = [
  { value: "email", icon: Mail },
  { value: "sms", icon: Smartphone },
  { value: "whatsapp", icon: MessageCircle },
  { value: "in_app", icon: Send },
]

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

function normalizeWhatsappPhone(value: string) {
  return value.replace(/[^\d]/g, "")
}

function buildInvitationUrl(baseUrl: string, slug: string, guest?: Guest | null) {
  const url = new URL(`/invitation/${encodeURIComponent(slug)}`, baseUrl)
  if (guest?.inviteCode) url.searchParams.set("code", guest.inviteCode)
  if (guest?.id) url.searchParams.set("guest", guest.id)
  return url.toString()
}

export default function InvitationsPage() {
  const { toast } = useToast()
  const [weddingId, setWeddingId] = useState<string | null>(null)
  const [weddingSlug, setWeddingSlug] = useState("demo")
  const [weddingName, setWeddingName] = useState("Votre mariage")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuestId, setSelectedGuestId] = useState("")
  const [source, setSource] = useState<"api" | "local">("local")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [channel, setChannel] = useState<MessageChannel>("whatsapp")
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("Votre invitation de mariage")
  const [body, setBody] = useState("")
  const [template, setTemplate] = useState<NotificationTemplateKey | "">("invitation")

  const selectedGuest = useMemo(
    () => guests.find((guest) => guest.id === selectedGuestId) ?? null,
    [guests, selectedGuestId],
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ndoa-two.vercel.app"
  const invitationUrl = buildInvitationUrl(appUrl, weddingSlug, selectedGuest)
  const whatsappPhone = normalizeWhatsappPhone(selectedGuest?.phone ?? recipient)
  const whatsappMessage = body.trim()
  const whatsappHref = whatsappPhone && whatsappMessage
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  const loadMessages = useCallback(async (target: string, preferredSource: "api" | "local" = "api") => {
    setLoading(true)
    if (preferredSource === "local") {
      setMessages(readLocalMessages(target))
      setSource("local")
      setLoading(false)
      return
    }
    try {
      const response = await listMessages(target)
      setMessages(response.items.map((item) => ({ ...item, source: "api" })))
      setSource("api")
    } catch (error) {
      if (!(error instanceof NotificationClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") {
        toast({ title: "Historique indisponible", description: error instanceof NotificationClientError ? error.message : "Reessayez.", variant: "error" })
      }
      setMessages(readLocalMessages(target))
      setSource("local")
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadGuests = useCallback(async (target: string, preferredSource: "api" | "local" = "api") => {
    if (preferredSource === "local") {
      setGuests(readLocalGuests(target))
      return
    }
    try {
      const response = await listGuests(target)
      setGuests(response.items.map(fromGuestApiRow))
    } catch (error) {
      if (!(error instanceof GuestClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") {
        toast({ title: "Liste des invites indisponible", description: error instanceof GuestClientError ? error.message : "Reessayez.", variant: "error" })
      }
      setGuests(readLocalGuests(target))
    }
  }, [toast])

  const applyTemplate = useCallback((nextTemplate: NotificationTemplateKey | "", guest?: Guest | null, slug?: string, name?: string) => {
    setTemplate(nextTemplate)
    if (!nextTemplate) return
    const invitationTarget = buildInvitationUrl(appUrl, slug ?? weddingSlug, guest ?? selectedGuest)
    const rendered = renderNotificationTemplate(nextTemplate, {
      name: guest ? `${guest.firstName} ${guest.lastName}` : "{{name}}",
      weddingName: name ?? weddingName,
      invitationUrl: invitationTarget,
    })
    const qrNote = guest?.inviteCode
      ? `\n\nVotre code d'acces/QR pour le jour J : ${guest.inviteCode}`
      : "\n\nLe QR code sera visible directement sur votre invitation."
    setSubject(rendered.subject)
    setBody(`${rendered.body}${qrNote}`)
  }, [appUrl, selectedGuest, weddingName, weddingSlug])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void resolveActiveWedding().then((active) => {
        const target = active.wedding?.id ?? null
        setWeddingId(target)
        setWeddingSlug(active.wedding?.slug ?? "demo")
        setWeddingName(active.wedding?.name ?? "Votre mariage")
        setSource(active.source)
        if (target) {
          void loadMessages(target, active.source)
          void loadGuests(target, active.source)
          applyTemplate("invitation", null, active.wedding?.slug ?? "demo", active.wedding?.name ?? "Votre mariage")
        } else {
          setMessages([])
          setGuests([])
          setLoading(false)
        }
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [applyTemplate, loadGuests, loadMessages])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!recipient.trim() || !body.trim()) {
      toast({ title: "Message incomplet", description: "Indiquez un destinataire et un contenu.", variant: "error" })
      return
    }
    if (channel === "whatsapp" && !selectedGuest) {
      toast({ title: "Selection requise", description: "Choisissez l'invite qui doit recevoir l'invitation WhatsApp.", variant: "error" })
      return
    }
    if (channel === "whatsapp" && !whatsappHref) {
      toast({ title: "Numero invalide", description: "Ajoutez un numero WhatsApp valide pour cet invite.", variant: "error" })
      return
    }

    setSubmitting(true)
    const now = new Date().toISOString()
    try {
      if (!weddingId) throw new Error("Creez d'abord un mariage avant de preparer une invitation.")
      const created = source === "api"
        ? {
            ...(await queueMessage(weddingId, {
              guestId: selectedGuest?.id ?? null,
              channel,
              recipient,
              subject,
              body,
              template: template || undefined,
            })),
            source: "api" as const,
          }
        : saveLocalMessage(weddingId, {
            id: `local-${makeId()}`,
            wedding_id: weddingId,
            guest_id: selectedGuest?.id ?? null,
            channel,
            recipient,
            subject: subject || null,
            body,
            status: "queued",
            scheduled_at: null,
            sent_at: null,
            created_at: now,
            updated_at: now,
            source: "local",
          })

      setMessages((current) => [created, ...current])

      if (channel === "whatsapp" && whatsappHref) {
        window.open(whatsappHref, "_blank", "noopener,noreferrer")
        toast({ title: "WhatsApp ouvert", description: "La conversation de l'invite a ete ouverte avec son invitation et son code QR.", variant: "success" })
      } else {
        toast({ title: "Message mis en file", description: `Canal : ${channelLabel(channel)}.`, variant: "success" })
      }
    } catch (error) {
      toast({ title: "Envoi impossible", description: error instanceof Error ? error.message : "Reessayez.", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9),rgba(245,158,11,0.78))] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-amber-200">
          <Sparkles className="size-4" />
          Communication
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">Invitations WhatsApp et QR</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50/92">
          Selectionnez un invite, ouvrez directement sa conversation WhatsApp et envoyez-lui son invitation personnalisee. Le lien contient son code, et le QR apparait ensuite sur sa page d&apos;invitation pour le scan le jour de l&apos;evenement.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form onSubmit={handleSubmit} className="surface-card space-y-5 p-6 sm:p-8">
          <div>
            <label className="text-sm font-medium" htmlFor="notification-guest">Invite</label>
            <select
              id="notification-guest"
              value={selectedGuestId}
              onChange={(event) => {
                const nextGuestId = event.target.value
                setSelectedGuestId(nextGuestId)
                const nextGuest = guests.find((guest) => guest.id === nextGuestId) ?? null
                if (nextGuest?.phone) setRecipient(nextGuest.phone)
                if (template) applyTemplate(template, nextGuest)
              }}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
            >
              <option value="">Choisir un invite</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName}{guest.phone ? ` - ${guest.phone}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="notification-template">Template</label>
            <select
              id="notification-template"
              value={template}
              onChange={(event) => applyTemplate(event.target.value as NotificationTemplateKey | "")}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
            >
              <option value="">Message personnalise</option>
              {Object.entries(notificationTemplates).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="notification-channel">Canal</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {channels.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChannel(value)}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm transition ${channel === value ? "border-amber-400 bg-amber-50 text-amber-800 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  aria-pressed={channel === value}
                >
                  <Icon className="size-4" />
                  {channelLabel(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="notification-recipient">Destinataire</label>
            <Input id="notification-recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={channel === "email" ? "invite@example.com" : "+243..."} maxLength={254} />
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="notification-subject">Objet (facultatif)</label>
            <Input id="notification-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} />
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="notification-body">Message</label>
            <Textarea id="notification-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Votre message..." maxLength={10000} />
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-950">Lien qui sera envoye</p>
            <p className="mt-2 break-all text-blue-800">{invitationUrl}</p>
            <p className="mt-3 text-slate-600">
              {selectedGuest?.inviteCode ? `Code/QR invite : ${selectedGuest.inviteCode}` : "Selectionnez un invite pour generer un code personnalise."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={submitting} className="flex-1">
              <Send className="size-4" />
              {channel === "whatsapp" ? (submitting ? "Ouverture..." : "Envoyer sur WhatsApp") : (submitting ? "Mise en file..." : "Mettre en file d'envoi")}
            </Button>
            {channel === "whatsapp" ? (
              <Button type="button" variant="outline" disabled={!whatsappHref} onClick={() => { if (whatsappHref) window.open(whatsappHref, "_blank", "noopener,noreferrer") }}>
                Ouvrir WhatsApp
              </Button>
            ) : null}
          </div>
        </form>

        <section className="surface-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Historique</p>
              <h2 className="mt-2 text-xl font-semibold">Messages prepares</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{source === "api" ? "Synchronise" : "Demo locale"}</span>
          </div>
          {loading ? (
            <p className="mt-8 text-sm text-slate-500">Chargement...</p>
          ) : messages.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">Aucun message dans la file.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {messages.map((message) => (
                <article key={message.id} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{message.subject || "Sans objet"}</p>
                      <p className="mt-1 text-xs text-slate-500">{message.recipient} · {channelLabel(message.channel)}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{message.status}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">{message.body}</p>
                  <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                    <Clock3 className="size-3" />
                    {new Date(message.created_at).toLocaleString("fr-FR")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

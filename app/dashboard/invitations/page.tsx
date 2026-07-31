"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Clock3, Mail, MessageCircle, Send, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { listMessages, NotificationClientError, queueMessage, type MessageItem } from "@/lib/notifications/client"
import { channelLabel, notificationTemplates, renderNotificationTemplate, type NotificationTemplateKey } from "@/lib/notifications/templates"
import { readLocalMessages, saveLocalMessage } from "@/lib/notifications/local-store"
import { resolveActiveWedding } from "@/lib/weddings/active"
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

export default function InvitationsPage() {
  const { toast } = useToast()
  const [weddingId, setWeddingId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [source, setSource] = useState<"api" | "local">("local")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [channel, setChannel] = useState<MessageChannel>("email")
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("Votre invitation de mariage")
  const [body, setBody] = useState("")
  const [template, setTemplate] = useState<NotificationTemplateKey | "">("invitation")

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
      if (!(error instanceof NotificationClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") toast({ title: "Historique indisponible", description: error instanceof NotificationClientError ? error.message : "Réessayez.", variant: "error" })
      setMessages(readLocalMessages(target))
      setSource("local")
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void resolveActiveWedding().then((active) => {
        const target = active.wedding?.id ?? null
        setWeddingId(target)
        setSource(active.source)
        if (target) void loadMessages(target, active.source)
        else {
          setMessages([])
          setLoading(false)
        }
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadMessages])

  function applyTemplate(value: NotificationTemplateKey | "") {
    setTemplate(value)
    if (value) {
      const rendered = renderNotificationTemplate(value, { name: "{{name}}", weddingName: "{{weddingName}}", invitationUrl: "{{invitationUrl}}" })
      setSubject(rendered.subject)
      setBody(rendered.body)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!recipient.trim() || !body.trim()) {
      toast({ title: "Message incomplet", description: "Indiquez un destinataire et un contenu.", variant: "error" })
      return
    }
    setSubmitting(true)
    const now = new Date().toISOString()
    try {
      if (!weddingId) throw new Error("Créez d’abord un mariage avant de préparer une invitation.")
      const created = source === "api"
        ? { ...(await queueMessage(weddingId, { channel, recipient, subject, body, template: template || undefined })), source: "api" as const }
        : saveLocalMessage(weddingId, { id: `local-${makeId()}`, wedding_id: weddingId, guest_id: null, channel, recipient, subject: subject || null, body, status: "queued", scheduled_at: null, sent_at: null, created_at: now, updated_at: now, source: "local" })
      setMessages((current) => [created, ...current])
      setRecipient("")
      toast({ title: "Message mis en file", description: `Canal : ${channelLabel(channel)}. Aucun fournisseur externe n’est configuré.`, variant: "success" })
    } catch (error) {
      toast({ title: "Envoi impossible", description: error instanceof NotificationClientError ? error.message : "Réessayez.", variant: "error" })
    } finally { setSubmitting(false) }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Communication</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Envoi des invitations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Préparez vos messages et suivez leur file d’envoi. La livraison réelle sera activée lorsqu’un fournisseur email, SMS ou WhatsApp sera configuré.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
          <div><label className="text-sm font-medium" htmlFor="notification-template">Template</label><select id="notification-template" value={template} onChange={(event) => applyTemplate(event.target.value as NotificationTemplateKey | "")} className="mt-2 h-11 w-full rounded-lg border border-input bg-white px-3 text-sm"><option value="">Message personnalisé</option>{Object.entries(notificationTemplates).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div>
          <div><label className="text-sm font-medium" htmlFor="notification-channel">Canal</label><div className="mt-2 grid grid-cols-2 gap-2">{channels.map(({ value, icon: Icon }) => <button key={value} type="button" onClick={() => setChannel(value)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${channel === value ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600"}`} aria-pressed={channel === value}><Icon className="size-4" />{channelLabel(value)}</button>)}</div></div>
          <div><label className="text-sm font-medium" htmlFor="notification-recipient">Destinataire</label><Input id="notification-recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={channel === "email" ? "invite@example.com" : "+243…"} maxLength={254} /></div>
          <div><label className="text-sm font-medium" htmlFor="notification-subject">Objet (facultatif)</label><Input id="notification-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} /></div>
          <div><label className="text-sm font-medium" htmlFor="notification-body">Message</label><Textarea id="notification-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Votre message…" maxLength={10000} /></div>
          <Button type="submit" disabled={submitting} className="w-full"><Send className="size-4" />{submitting ? "Mise en file…" : "Mettre en file d’envoi"}</Button>
        </form>
        <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between"><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Historique</p><h2 className="mt-2 text-xl font-semibold">Messages préparés</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{source === "api" ? "Synchronisé" : "Démo locale"}</span></div>{loading ? <p className="mt-8 text-sm text-slate-500">Chargement…</p> : messages.length === 0 ? <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">Aucun message dans la file.</p> : <div className="mt-5 space-y-3">{messages.map((message) => <article key={message.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-900">{message.subject || "Sans objet"}</p><p className="mt-1 text-xs text-slate-500">{message.recipient} · {channelLabel(message.channel)}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{message.status}</span></div><p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">{message.body}</p><p className="mt-3 flex items-center gap-1 text-xs text-slate-400"><Clock3 className="size-3" />{new Date(message.created_at).toLocaleString("fr-FR")}</p></article>)}</div>}</section>
      </div>
    </main>
  )
}

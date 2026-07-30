"use client"

import type { ComponentType } from "react"
import { useEffect, useState } from "react"
import { Bell, Database, Globe2, LockKeyhole, Settings, ShieldCheck } from "lucide-react"

type HealthPayload = {
  status: string
  checks?: { app?: boolean; supabaseConfigured?: boolean; supabaseDatabase?: boolean }
}

const defaultSettings = [
  { id: "sms", label: "Préparer les relances SMS/WhatsApp", description: "Garde les numéros prêts pour un futur fournisseur d’envoi.", enabled: true, icon: Bell },
  { id: "privacy", label: "Masquer les données sensibles", description: "Les invités publics ne voient jamais les contacts des autres invités.", enabled: true, icon: LockKeyhole },
  { id: "rsvp", label: "RSVP simplifié", description: "Confirmation avec prénom, nom, téléphone et réponse uniquement.", enabled: true, icon: ShieldCheck },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [health, setHealth] = useState<HealthPayload | null>(null)

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((payload: HealthPayload) => setHealth(payload))
      .catch(() => setHealth({ status: "degraded" }))
  }, [])

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 p-8 text-white shadow-xl shadow-blue-950/20">
        <div className="flex items-center gap-3">
          <Settings className="size-6 text-amber-200" />
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Paramètres</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">Configuration de l’application</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">
          État de production, préférences de sécurité et comportement du RSVP.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard icon={Globe2} label="Application" value={health?.checks?.app ? "En ligne" : "À vérifier"} />
        <StatusCard icon={Database} label="Supabase" value={health?.checks?.supabaseConfigured ? "Connecté" : "Non configuré"} />
        <StatusCard icon={ShieldCheck} label="Base de données" value={health?.checks?.supabaseDatabase ? "Prête" : "À vérifier"} />
      </section>

      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Préférences actives</h2>
        <div className="mt-6 grid gap-4">
          {settings.map((item) => {
            const Icon = item.icon
            return (
              <label key={item.id} className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4">
                <span className="flex items-center gap-4">
                  <span className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-slate-950">{item.label}</span>
                    <span className="text-sm text-slate-600">{item.description}</span>
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => setSettings((current) => current.map((setting) => setting.id === item.id ? { ...setting, enabled: !setting.enabled } : setting))}
                  className="size-5 accent-blue-700"
                />
              </label>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function StatusCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="size-5 text-amber-500" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

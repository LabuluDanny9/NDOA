"use client"

import type { ComponentType } from "react"
import { useEffect, useState } from "react"
import { Bell, Database, Globe2, LockKeyhole, Settings, ShieldCheck } from "lucide-react"
import { useToast } from "@/components/ui/toast"

type HealthPayload = {
  status: string
  checks?: { app?: boolean; supabaseConfigured?: boolean; supabaseDatabase?: boolean }
}

type SettingItem = {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: ComponentType<{ className?: string }>
}

const SETTINGS_STORAGE_KEY = "ndoa:dashboard:settings:v1"

const defaultSettings: SettingItem[] = [
  {
    id: "sms",
    label: "Preparar les relances SMS/WhatsApp",
    description: "Garde les numeros prets pour un futur fournisseur d'envoi.",
    enabled: true,
    icon: Bell,
  },
  {
    id: "privacy",
    label: "Masquer les donnees sensibles",
    description: "Les invites publics ne voient jamais les contacts des autres invites.",
    enabled: true,
    icon: LockKeyhole,
  },
  {
    id: "rsvp",
    label: "RSVP simplifie",
    description: "Confirmation avec prenom, nom, telephone et reponse uniquement.",
    enabled: true,
    icon: ShieldCheck,
  },
]

function readStoredSettings() {
  if (typeof window === "undefined") return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "null") as null | Record<string, boolean>
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function mergeSettings(stored: null | Record<string, boolean>): SettingItem[] {
  return defaultSettings.map((item) => ({
    ...item,
    enabled: typeof stored?.[item.id] === "boolean" ? stored[item.id] : item.enabled,
  }))
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SettingItem[]>(() => mergeSettings(readStoredSettings()))
  const [health, setHealth] = useState<HealthPayload | null>(null)

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((payload: HealthPayload) => setHealth(payload))
      .catch(() => setHealth({ status: "degraded" }))
  }, [])

  function toggleSetting(settingId: string) {
    setSettings((current) => {
      const next = current.map((setting) =>
        setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting,
      )
      if (typeof window !== "undefined") {
        const serialized = Object.fromEntries(next.map((setting) => [setting.id, setting.enabled]))
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(serialized))
      }
      const changed = next.find((setting) => setting.id === settingId)
      if (changed) {
        toast({
          title: changed.enabled ? "Preference activee" : "Preference desactivee",
          description: changed.label,
          variant: "success",
        })
      }
      return next
    })
  }

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 p-8 text-white shadow-xl shadow-blue-950/20">
        <div className="flex items-center gap-3">
          <Settings className="size-6 text-amber-200" />
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Parametres</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">Configuration application</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">
          Etat de production, preferences de securite et comportement du RSVP.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard icon={Globe2} label="Application" value={health?.checks?.app ? "En ligne" : "A verifier"} />
        <StatusCard icon={Database} label="Supabase" value={health?.checks?.supabaseConfigured ? "Connecte" : "Non configure"} />
        <StatusCard icon={ShieldCheck} label="Base de donnees" value={health?.checks?.supabaseDatabase ? "Prete" : "A verifier"} />
      </section>

      <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Preferences actives</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ces reglages sont maintenant conserves dans ce navigateur et survivent au rechargement.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Sauvegarde locale
          </span>
        </div>
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
                  onChange={() => toggleSetting(item.id)}
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

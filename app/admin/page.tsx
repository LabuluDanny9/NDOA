"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Activity, Camera, CheckCircle2, QrCode, Search, Settings2, ShieldCheck, Sparkles, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { AdminClientError, listAdminActivity, listAdminUsers, readAdminConfig, updateAdminUser, type AdminUser } from "@/lib/admin/client"
import { checkInGuest, fromGuestApiRow, GuestClientError, listGuests } from "@/lib/guests/client"
import { markLocalGuestCheckedIn, readLocalGuests } from "@/lib/guests/local-store"
import { resolveActiveWedding } from "@/lib/weddings/active"
import type { Guest } from "@/components/guests/types"
import type { AccountStatus, AppRole } from "@/types/database.types"

type ActivityItem = { id: string; action: string; entity_type: string; occurred_at: string }
type BarcodeDetectorResult = { rawValue?: string }
type BarcodeDetectorLike = new (options?: { formats?: string[] }) => { detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorResult[]> }

const demoUsers: AdminUser[] = [{ id: "00000000-0000-0000-0000-0000000000ad", email: "admin@ndoa.demo", display_name: "Administrateur Demo", status: "active", role: "admin", last_sign_in_at: new Date().toISOString(), created_at: new Date().toISOString() }]

function normalizeScannedCode(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("ndoa://guest/")) return trimmed.split("/").pop()?.trim().toUpperCase() ?? ""
  try {
    const url = new URL(trimmed)
    const queryCode = url.searchParams.get("code")
    if (queryCode) return queryCode.trim().toUpperCase()
  } catch {}
  return trimmed.toUpperCase()
}

export default function AdminPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [configured, setConfigured] = useState(false)
  const [source, setSource] = useState<"api" | "demo">("demo")
  const [loading, setLoading] = useState(true)
  const [weddingId, setWeddingId] = useState<string | null>(null)
  const [weddingName, setWeddingName] = useState("Mariage actif")
  const [guestSource, setGuestSource] = useState<"api" | "local">("local")
  const [guests, setGuests] = useState<Guest[]>([])
  const [scanInput, setScanInput] = useState("")
  const [scanBusy, setScanBusy] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraMessage, setCameraMessage] = useState("Activez la camera pour scanner les QR codes a l'entree.")
  const [lastScan, setLastScan] = useState<{ code: string; guestName: string; checkedInAt: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<number | null>(null)
  const detectorRef = useRef<{ detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorResult[]> } | null>(null)
  const handlingScanRef = useRef(false)

  const checkedInGuests = useMemo(() => guests.filter((guest) => Boolean(guest.checkedInAt)), [guests])

  const stopScanner = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const handleGuestCheckIn = useCallback(async (rawValue: string) => {
    const code = normalizeScannedCode(rawValue)
    if (!code || handlingScanRef.current) return
    if (!weddingId) {
      toast({ title: "Mariage introuvable", description: "Chargez d'abord un mariage actif pour scanner les invitations.", variant: "error" })
      return
    }

    const guest = guests.find((item) => (item.inviteCode ?? "").toUpperCase() === code)
    if (!guest) {
      toast({ title: "Code inconnu", description: `Aucun invite ne correspond au code ${code}.`, variant: "error" })
      return
    }
    if (guest.checkedInAt) {
      setLastScan({ code, guestName: `${guest.firstName} ${guest.lastName}`, checkedInAt: guest.checkedInAt })
      toast({ title: "Invite deja scanne", description: `${guest.firstName} ${guest.lastName} a deja ete enregistre.`, variant: "info" })
      return
    }

    handlingScanRef.current = true
    setScanBusy(true)
    const checkedInAt = new Date().toISOString()
    try {
      const saved = guestSource === "api"
        ? fromGuestApiRow(await checkInGuest(weddingId, guest.id, checkedInAt))
        : markLocalGuestCheckedIn(weddingId, guest.id, checkedInAt)

      if (!saved) throw new Error("Impossible de mettre a jour cet invite.")

      setGuests((current) => current.map((item) => item.id === guest.id ? { ...item, checkedInAt: saved.checkedInAt ?? checkedInAt, updatedAt: saved.updatedAt ?? checkedInAt } : item))
      setLastScan({ code, guestName: `${guest.firstName} ${guest.lastName}`, checkedInAt })
      toast({ title: "Invite valide", description: `${guest.firstName} ${guest.lastName} est maintenant marque comme present.`, variant: "success" })
    } catch (error) {
      toast({ title: "Scan impossible", description: error instanceof Error ? error.message : "Reessayez.", variant: "error" })
    } finally {
      setScanInput("")
      setScanBusy(false)
      handlingScanRef.current = false
    }
  }, [guestSource, guests, toast, weddingId])

  const startScanner = useCallback(async () => {
    const BarcodeDetectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorLike }).BarcodeDetector
    if (!BarcodeDetectorCtor) {
      setCameraMessage("Le navigateur ne prend pas en charge le scan natif. Utilisez la saisie manuelle du code QR.")
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("La camera n'est pas disponible sur cet appareil.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      streamRef.current = stream
      detectorRef.current = new BarcodeDetectorCtor({ formats: ["qr_code"] })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      intervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || !detectorRef.current || handlingScanRef.current || videoRef.current.readyState < 2) return
        const results = await detectorRef.current.detect(videoRef.current)
        const firstValue = results.find((result) => result.rawValue)?.rawValue
        if (firstValue) void handleGuestCheckIn(firstValue)
      }, 700)

      setCameraMessage("Camera active. Placez le QR code de l'invite devant l'objectif.")
      setIsScanning(true)
    } catch (error) {
      setCameraMessage(error instanceof Error ? error.message : "Impossible d'activer la camera.")
      stopScanner()
    }
  }, [handleGuestCheckIn, stopScanner])

  useEffect(() => () => stopScanner(), [stopScanner])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([listAdminUsers(), listAdminActivity(), readAdminConfig()]).then(([userResponse, activityResponse, config]) => {
        setUsers(userResponse.items)
        setActivity(activityResponse.items)
        setConfigured(config.supabaseConfigured)
        setSource("api")
      }).catch((error: unknown) => {
        if (!(error instanceof AdminClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") {
          toast({ title: "Administration en mode demo", description: error instanceof AdminClientError ? error.message : "Les donnees locales sont affichees.", variant: "info" })
        }
        setUsers(demoUsers)
        setActivity([])
        setSource("demo")
      }).finally(() => setLoading(false))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void resolveActiveWedding().then(async (active) => {
        const target = active.wedding?.id ?? null
        setWeddingId(target)
        setWeddingName(active.wedding?.name ?? "Mariage actif")
        if (!target) {
          setGuests([])
          setGuestSource("local")
          return
        }
        if (active.source === "local") {
          setGuests(readLocalGuests(target))
          setGuestSource("local")
          return
        }
        try {
          const response = await listGuests(target)
          setGuests(response.items.map(fromGuestApiRow))
          setGuestSource("api")
        } catch (error) {
          if (!(error instanceof GuestClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") {
            toast({ title: "Invites indisponibles", description: error instanceof GuestClientError ? error.message : "Les invites locaux sont utilises.", variant: "info" })
          }
          setGuests(readLocalGuests(target))
          setGuestSource("local")
        }
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function updateUser(user: AdminUser, field: "status" | "role", value: AccountStatus | AppRole) {
    const update = field === "status" ? { status: value as AccountStatus } : { role: value as AppRole }
    try {
      const saved = source === "api" ? await updateAdminUser(user.id, update) : { ...user, ...update }
      setUsers((current) => current.map((item) => item.id === user.id ? saved : item))
      toast({ title: "Compte mis a jour", description: `${user.display_name} - ${field === "role" ? saved.role : saved.status}`, variant: "success" })
    } catch (error) {
      toast({ title: "Modification refusee", description: error instanceof AdminClientError ? error.message : "Reessayez.", variant: "error" })
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="hero-glow overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95),rgba(30,64,175,0.88))] p-6 text-white shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-amber-300">
              <Sparkles className="size-4" />
              Controle plateforme
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Espace administrateur</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Gere les comptes, surveille l&apos;activite et scanne les QR codes des invitations a l&apos;arrivee des invites.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-md">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-300" />
              {source === "api" ? "Donnees synchronisees" : "Demonstration locale"}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="surface-card p-5"><UserCog className="size-5 text-amber-600" /><p className="mt-4 text-3xl font-semibold">{users.length}</p><p className="text-sm text-slate-500">Comptes visibles</p></div>
        <div className="surface-card p-5"><Activity className="size-5 text-sky-600" /><p className="mt-4 text-3xl font-semibold">{activity.length}</p><p className="text-sm text-slate-500">Evenements recents</p></div>
        <div className="surface-card p-5"><Settings2 className="size-5 text-violet-600" /><p className="mt-4 text-3xl font-semibold">{configured ? "Actif" : "Demo"}</p><p className="text-sm text-slate-500">Configuration Supabase</p></div>
        <div className="surface-card p-5"><QrCode className="size-5 text-blue-700" /><p className="mt-4 text-3xl font-semibold">{checkedInGuests.length}</p><p className="text-sm text-slate-500">Invites deja scannes</p></div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-700">Controle d&apos;acces</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Scanner QR des invitations</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Mariage actif : <span className="font-medium text-slate-900">{weddingName}</span></p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">Source invites : {guestSource === "api" ? "API" : "Locale"}</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-blue-100 bg-slate-950">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          </div>

          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-950">{cameraMessage}</p>
            <p className="mt-2 text-slate-600">Si la camera n&apos;est pas disponible, vous pouvez entrer le code invite manuellement ci-dessous.</p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {isScanning ? (
              <Button type="button" variant="outline" onClick={stopScanner}>Arreter le scan</Button>
            ) : (
              <Button type="button" onClick={() => void startScanner()}><Camera className="size-4" /> Demarrer la camera</Button>
            )}
          </div>

          <form className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={(event) => { event.preventDefault(); void handleGuestCheckIn(scanInput) }}>
            <Input value={scanInput} onChange={(event) => setScanInput(event.target.value)} placeholder="Ex: ABCD1234 ou collez le lien complet de l&apos;invitation" maxLength={500} />
            <Button type="submit" disabled={scanBusy || !scanInput.trim()}><Search className="size-4" /> Valider le code</Button>
          </form>

          {lastScan ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-medium">Dernier passage valide : {lastScan.guestName}</p>
              <p className="mt-1">Code : {lastScan.code}</p>
              <p className="mt-1">Heure : {new Date(lastScan.checkedInAt).toLocaleString("fr-FR")}</p>
            </div>
          ) : null}
        </div>

        <div className="surface-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Etat des entrees</h2>
              <p className="mt-1 text-sm text-slate-500">{checkedInGuests.length} sur {guests.length} invites scannes</p>
            </div>
            <QrCode className="size-5 text-amber-600" />
          </div>
          {guests.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun invite charge pour le moment.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {guests.slice().sort((a, b) => Number(Boolean(b.checkedInAt)) - Number(Boolean(a.checkedInAt))).map((guest) => (
                <div key={guest.id} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{guest.firstName} {guest.lastName}</p>
                      <p className="mt-1 text-xs text-slate-500">{guest.phone ?? "Sans numero"} · {guest.inviteCode ?? "Code indisponible"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${guest.checkedInAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {guest.checkedInAt ? "Scanne" : "En attente"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{guest.checkedInAt ? `Enregistre le ${new Date(guest.checkedInAt).toLocaleString("fr-FR")}` : "Pas encore passe au point de controle."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <div className="flex items-center gap-3"><ShieldCheck className="size-5 text-amber-600" /><h2 className="text-xl font-semibold">Utilisateurs et permissions</h2></div>
        {loading ? <p className="mt-6 text-sm text-slate-500">Chargement...</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Compte</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Statut</th><th className="px-3 py-3">Derniere connexion</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-50"><td className="px-3 py-4"><p className="font-medium text-slate-900">{user.display_name}</p><p className="text-xs text-slate-500">{user.email ?? "Sans email"}</p></td><td className="px-3 py-4"><select aria-label={`Role de ${user.display_name}`} value={user.role} onChange={(event) => void updateUser(user, "role", event.target.value as AppRole)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"><option value="admin">Admin</option><option value="organizer">Organisateur</option><option value="guest">Invite</option></select></td><td className="px-3 py-4"><select aria-label={`Statut de ${user.display_name}`} value={user.status} onChange={(event) => void updateUser(user, "status", event.target.value as AccountStatus)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"><option value="active">Actif</option><option value="suspended">Suspendu</option><option value="disabled">Desactive</option></select></td><td className="px-3 py-4 text-slate-500">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("fr-FR") : "Jamais"}</td></tr>)}</tbody></table></div>}
      </section>

      <section className="surface-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Journal d&apos;activite</h2>
        {activity.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun evenement disponible dans cet environnement.</p> : <div className="mt-5 space-y-3">{activity.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white/80 p-4"><p className="text-sm text-slate-700">{item.action} · {item.entity_type}</p><time className="text-xs text-slate-400">{new Date(item.occurred_at).toLocaleString("fr-FR")}</time></div>)}</div>}
        <Button variant="outline" className="mt-5" onClick={() => toast({ title: "Journal protege", description: "Les evenements sont filtres par le role administrateur cote serveur.", variant: "info" })}>A propos des permissions</Button>
      </section>
    </main>
  )
}

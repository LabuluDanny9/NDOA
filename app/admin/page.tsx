"use client"

import { useEffect, useState } from "react"
import { Activity, CheckCircle2, Settings2, ShieldCheck, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { AdminClientError, listAdminActivity, listAdminUsers, readAdminConfig, updateAdminUser, type AdminUser } from "@/lib/admin/client"
import type { AccountStatus, AppRole } from "@/types/database.types"

type ActivityItem = { id: string; action: string; entity_type: string; occurred_at: string }

const demoUsers: AdminUser[] = [{ id: "00000000-0000-0000-0000-0000000000ad", email: "admin@ndoa.demo", display_name: "Administrateur Démo", status: "active", role: "admin", last_sign_in_at: new Date().toISOString(), created_at: new Date().toISOString() }]

export default function AdminPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [configured, setConfigured] = useState(false)
  const [source, setSource] = useState<"api" | "demo">("demo")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([listAdminUsers(), listAdminActivity(), readAdminConfig()]).then(([userResponse, activityResponse, config]) => {
        setUsers(userResponse.items)
        setActivity(activityResponse.items)
        setConfigured(config.supabaseConfigured)
        setSource("api")
      }).catch((error: unknown) => {
        if (!(error instanceof AdminClientError) || error.code !== "SUPABASE_NOT_CONFIGURED") toast({ title: "Administration en mode démo", description: error instanceof AdminClientError ? error.message : "Les données locales sont affichées.", variant: "info" })
        setUsers(demoUsers)
        setActivity([])
        setSource("demo")
      }).finally(() => setLoading(false))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function updateUser(user: AdminUser, field: "status" | "role", value: AccountStatus | AppRole) {
    const update = field === "status" ? { status: value as AccountStatus } : { role: value as AppRole }
    try {
      const saved = source === "api" ? await updateAdminUser(user.id, update) : { ...user, ...update }
      setUsers((current) => current.map((item) => item.id === user.id ? saved : item))
      toast({ title: "Compte mis à jour", description: `${user.display_name} — ${field === "role" ? saved.role : saved.status}`, variant: "success" })
    } catch (error) {
      toast({ title: "Modification refusée", description: error instanceof AdminClientError ? error.message : "Réessayez.", variant: "error" })
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm uppercase tracking-[0.24em] text-amber-300">Contrôle plateforme</p><h1 className="mt-3 text-3xl font-semibold">Espace administrateur</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Gérez les rôles et statuts des comptes, inspectez l’activité et vérifiez les intégrations sans exposer de secret.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" />{source === "api" ? "Données synchronisées" : "Démonstration locale"}</span></div></div></section>
      <div className="grid gap-6 md:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm"><UserCog className="size-5 text-amber-600" /><p className="mt-4 text-3xl font-semibold">{users.length}</p><p className="text-sm text-slate-500">Comptes visibles</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><Activity className="size-5 text-sky-600" /><p className="mt-4 text-3xl font-semibold">{activity.length}</p><p className="text-sm text-slate-500">Événements récents</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><Settings2 className="size-5 text-violet-600" /><p className="mt-4 text-3xl font-semibold">{configured ? "Actif" : "Démo"}</p><p className="text-sm text-slate-500">Configuration Supabase</p></div></div>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-amber-600" /><h2 className="text-xl font-semibold">Utilisateurs et permissions</h2></div>{loading ? <p className="mt-6 text-sm text-slate-500">Chargement…</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Compte</th><th className="px-3 py-3">Rôle</th><th className="px-3 py-3">Statut</th><th className="px-3 py-3">Dernière connexion</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-50"><td className="px-3 py-4"><p className="font-medium text-slate-900">{user.display_name}</p><p className="text-xs text-slate-500">{user.email ?? "Sans email"}</p></td><td className="px-3 py-4"><select aria-label={`Rôle de ${user.display_name}`} value={user.role} onChange={(event) => void updateUser(user, "role", event.target.value as AppRole)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"><option value="admin">Admin</option><option value="organizer">Organisateur</option><option value="guest">Invité</option></select></td><td className="px-3 py-4"><select aria-label={`Statut de ${user.display_name}`} value={user.status} onChange={(event) => void updateUser(user, "status", event.target.value as AccountStatus)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"><option value="active">Actif</option><option value="suspended">Suspendu</option><option value="disabled">Désactivé</option></select></td><td className="px-3 py-4 text-slate-500">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("fr-FR") : "Jamais"}</td></tr>)}</tbody></table></div>}</section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-semibold">Journal d’activité</h2>{activity.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun événement disponible dans cet environnement.</p> : <div className="mt-5 space-y-3">{activity.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"><p className="text-sm text-slate-700">{item.action} · {item.entity_type}</p><time className="text-xs text-slate-400">{new Date(item.occurred_at).toLocaleString("fr-FR")}</time></div>)}</div>}<Button variant="outline" className="mt-5" onClick={() => toast({ title: "Journal protégé", description: "Les événements sont filtrés par le rôle administrateur côté serveur.", variant: "info" })}>À propos des permissions</Button></section>
    </main>
  )
}

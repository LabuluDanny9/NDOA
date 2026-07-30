import type { AccountStatus, AppRole } from "@/types/database.types"

export interface AdminUser {
  id: string
  email: string | null
  display_name: string
  status: AccountStatus
  role: AppRole
  last_sign_in_at: string | null
  created_at: string
}

export class AdminClientError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number) {
    super(message)
    this.name = "AdminClientError"
  }
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, init)
  const body = await response.json().catch(() => null) as { data?: T; error?: { code?: string; message?: string } } | null
  if (!response.ok || body?.data === undefined) throw new AdminClientError(body?.error?.message ?? "Requête administrateur impossible.", body?.error?.code ?? "REQUEST_FAILED", response.status)
  return body.data
}

export function listAdminUsers() { return request<{ items: AdminUser[] }>("/api/admin/users") }
export function updateAdminUser(userId: string, update: { status?: AccountStatus; role?: AppRole }) {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(userId)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(update) })
}
export function listAdminActivity() { return request<{ items: Array<{ id: string; action: string; entity_type: string; occurred_at: string }> }>("/api/admin/activity") }
export function readAdminConfig() { return request<{ environment: string; supabaseConfigured: boolean; providers: { email: boolean; sms: boolean; whatsapp: boolean } }>("/api/admin/config") }

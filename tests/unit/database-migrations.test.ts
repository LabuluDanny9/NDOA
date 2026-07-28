import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const migrationDirectory = join(process.cwd(), "supabase", "migrations")

const migrationFiles = [
  "20260728080000_identity_and_roles.sql",
  "20260728081000_weddings_core.sql",
  "20260728082000_wedding_domains.sql",
  "20260728083000_integrity_and_activity.sql",
  "20260728084000_row_level_security.sql",
  "20260728090000_public_invitation_projection.sql",
]

const migrations = migrationFiles
  .map((file) => readFileSync(join(migrationDirectory, file), "utf8"))
  .join("\n")
const supabaseConfig = readFileSync(
  join(process.cwd(), "supabase", "config.toml"),
  "utf8"
)

const requiredTables = [
  "users",
  "profiles",
  "user_roles",
  "weddings",
  "wedding_members",
  "events",
  "programs",
  "guests",
  "guest_groups",
  "guest_tables",
  "gallery",
  "albums",
  "photos",
  "rsvps",
  "messages",
  "notifications",
  "gift_registry",
  "qr_codes",
  "activity_logs",
]

describe("migrations Supabase", () => {
  it("versionne les migrations dans l'ordre attendu", () => {
    expect(migrationFiles).toEqual([...migrationFiles].sort())
  })

  it.each(requiredTables)("crée la table public.%s", (tableName) => {
    expect(migrations).toMatch(
      new RegExp(`create table public\\.${tableName}\\s*\\(`, "i")
    )
  })

  it.each(requiredTables)("active RLS sur public.%s", (tableName) => {
    expect(migrations).toMatch(
      new RegExp(
        `alter table public\\.${tableName} enable row level security`,
        "i"
      )
    )
  })

  it("n'accorde aucune table métier au rôle anon", () => {
    expect(migrations).not.toMatch(
      /grant\s+(?:select|insert|update|delete)[^\n]*\bto\s+anon\b/i
    )
  })

  it("stocke uniquement l'empreinte des jetons QR", () => {
    const qrTable = migrations.match(
      /create table public\.qr_codes\s*\(([\s\S]*?)\n\);/i
    )?.[1]

    expect(qrTable).toContain("token_hash bytea not null")
    expect(qrTable).not.toMatch(/\btoken\s+text\b/i)
  })

  it("définit les fonctions sensibles hors du schéma exposé", () => {
    expect(migrations).toContain(
      "create or replace function private.can_view_wedding"
    )
    expect(migrations).toContain(
      "create or replace function private.can_manage_wedding"
    )
    expect(migrations).toContain("security definer")
    expect(migrations).toContain("set search_path = ''")
  })

  it("protège le bucket média par le wedding_id du chemin", () => {
    expect(migrations).toContain("'wedding-media'")
    expect(migrations).toContain("private.storage_wedding_id(name)")
    expect(migrations).toContain(
      "private.can_manage_wedding"
    )
  })

  it("active localement le hook qui signe le rôle applicatif", () => {
    expect(supabaseConfig).toContain("[auth.hook.custom_access_token]")
    expect(supabaseConfig).toContain(
      'uri = "pg-functions://postgres/public/custom_access_token_hook"'
    )
  })

  it("expose la projection publique sans donner accès aux tables métier", () => {
    expect(migrations).toContain("create or replace function public.get_public_invitation")
    expect(migrations).toContain("grant execute on function public.get_public_invitation(text) to anon, authenticated")
    expect(migrations).toContain("where wedding.slug = target_slug and wedding.status = 'published'")
    expect(migrations).toContain("never returns guests")
  })
})

import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { PGlite } from "@electric-sql/pglite"

const projectRoot = process.cwd()
const migrationDirectory = join(projectRoot, "supabase", "migrations")
const migrationFiles = readdirSync(migrationDirectory)
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort()

const bootstrap = String.raw`
create schema auth;
create schema storage;

create role anon;
create role authenticated;
create role supabase_auth_admin;

create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

grant usage on schema auth to anon, authenticated, supabase_auth_admin;
grant execute on function auth.uid() to anon, authenticated, supabase_auth_admin;
grant execute on function auth.jwt() to anon, authenticated, supabase_auth_admin;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  name text not null,
  owner_id uuid,
  created_at timestamptz not null default now()
);
`

const db = new PGlite("memory://")

const userA = "00000000-0000-0000-0000-000000000001"
const userB = "00000000-0000-0000-0000-000000000002"

async function authenticate(userId, role = "organizer") {
  await db.exec("reset role")
  await db.exec("set role authenticated")
  await db.exec(
    `select set_config('request.jwt.claims', '${JSON.stringify({ sub: userId, user_role: role })}', false), set_config('request.jwt.claim.sub', '${userId}', false)`
  )
}

async function expectRejected(query, label) {
  try {
    await db.exec(query)
  } catch {
    return
  }

  throw new Error(`RLS smoke test did not reject: ${label}`)
}

try {
  await db.exec(bootstrap)

  for (const file of migrationFiles) {
    process.stdout.write(`Validating ${file}... `)
    await db.exec(readFileSync(join(migrationDirectory, file), "utf8"))
    process.stdout.write("ok\n")
  }

  const tableResult = await db.query(
    "select count(*)::int as count from pg_tables where schemaname = 'public'"
  )
  const tableCount = tableResult.rows[0]?.count
  process.stdout.write(`Validated ${migrationFiles.length} migrations and ${tableCount} public tables.\n`)

  await db.exec(`
    reset role;
    insert into auth.users (id, email, raw_user_meta_data)
    values
      ('${userA}', 'a@ndoa.test', '{"full_name":"Organizer A"}'),
      ('${userB}', 'b@ndoa.test', '{"full_name":"Organizer B"}');
  `)

  await authenticate(userA)
  const authCheck = await db.query(
    "select auth.uid()::text as uid, auth.jwt() as claims, private.current_app_role()::text as app_role, (private.current_app_role() in ('admin', 'organizer')) as role_allowed, exists (select 1 from public.users where id = auth.uid()) as user_visible"
  )
  if (
    authCheck.rows[0]?.uid !== userA ||
    authCheck.rows[0]?.app_role !== "organizer" ||
    authCheck.rows[0]?.role_allowed !== true ||
    authCheck.rows[0]?.user_visible !== true
  ) {
    throw new Error("RLS smoke test has an invalid authenticated context")
  }
  const weddingResult = await db.query(`
    insert into public.weddings (
      owner_id,
      name,
      slug,
      partner_one_name,
      partner_two_name
    )
    values ('${userA}', 'Mariage A', 'mariage-a', 'A', 'Partenaire A')
    returning id
  `)
  const weddingId = weddingResult.rows[0]?.id

  if (typeof weddingId !== "string") {
    throw new Error("RLS smoke test did not create wedding A")
  }

  const ownRows = await db.query(
    "select count(*)::int as count from public.weddings"
  )
  if (ownRows.rows[0]?.count !== 1) {
    throw new Error("RLS smoke test could not read the owner's wedding")
  }

  await authenticate(userB)
  const foreignRows = await db.query(
    "select count(*)::int as count from public.weddings"
  )
  if (foreignRows.rows[0]?.count !== 0) {
    throw new Error("RLS smoke test leaked a foreign wedding")
  }

  await expectRejected(
    `insert into public.events (wedding_id, title, starts_at) values ('${weddingId}', 'Intrusion', now())`,
    "cross-tenant event insert"
  )
  process.stdout.write("RLS smoke test passed: tenant A is isolated from tenant B.\n")
} catch (error) {
  console.error("\nSupabase migration validation failed.")
  console.error(error)
  process.exitCode = 1
} finally {
  await db.close()
}

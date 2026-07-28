begin;

create type public.app_role as enum ('admin', 'organizer', 'guest');
create type public.account_status as enum ('active', 'suspended', 'disabled');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  status public.account_status not null default 'active',
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_length check (email is null or char_length(email) <= 254)
);

create unique index users_email_unique
  on public.users (lower(email))
  where email is not null;

create table public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null,
  first_name text,
  last_name text,
  phone text,
  avatar_path text,
  city text,
  country text,
  locale text not null default 'fr',
  timezone text not null default 'Africa/Lubumbashi',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(display_name) between 1 and 100),
  constraint profiles_phone_length
    check (phone is null or char_length(phone) <= 32),
  constraint profiles_avatar_path_length
    check (avatar_path is null or char_length(avatar_path) <= 512)
);

create table public.user_roles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role public.app_role not null default 'organizer',
  assigned_by uuid references public.users(id) on delete set null,
  assigned_at timestamptz not null default now()
);

create index user_roles_role_idx on public.user_roles (role, user_id);
create index user_roles_assigned_by_idx on public.user_roles (assigned_by)
  where assigned_by is not null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  profile_name := coalesce(
    profile_name,
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Utilisateur NDOA'
  );

  insert into public.users (id, email, last_sign_in_at, created_at, updated_at)
  values (new.id, lower(new.email), new.last_sign_in_at, new.created_at, now())
  on conflict (id) do update
    set email = excluded.email,
        last_sign_in_at = excluded.last_sign_in_at,
        updated_at = now();

  insert into public.profiles (user_id, display_name)
  values (new.id, left(profile_name, 100))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'organizer')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, last_sign_in_at on auth.users
for each row execute function private.handle_new_auth_user();

insert into public.users (id, email, last_sign_in_at, created_at, updated_at)
select id, lower(email), last_sign_in_at, created_at, now()
from auth.users
on conflict (id) do nothing;

insert into public.profiles (user_id, display_name)
select
  id,
  left(
    coalesce(
      nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(email, ''), '@', 1), ''),
      'Utilisateur NDOA'
    ),
    100
  )
from auth.users
on conflict (user_id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'organizer'::public.app_role
from auth.users
on conflict (user_id) do nothing;

create or replace function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select case auth.jwt() ->> 'user_role'
    when 'admin' then 'admin'::public.app_role
    when 'guest' then 'guest'::public.app_role
    else 'organizer'::public.app_role
  end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'user_role') = 'admin', false);
$$;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
  assigned_role public.app_role;
begin
  select role
  into assigned_role
  from public.user_roles
  where user_id = (event ->> 'user_id')::uuid
  limit 1;

  assigned_role := coalesce(assigned_role, 'organizer'::public.app_role);
  claims := event -> 'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(assigned_role), true);

  return jsonb_set(event, '{claims}', claims, true);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb)
  to supabase_auth_admin;
grant select on public.user_roles to supabase_auth_admin;

revoke execute on function public.custom_access_token_hook(jsonb)
  from public, anon, authenticated;

comment on table public.users is
  'Compte applicatif minimal adossé à auth.users; ne stocke aucun secret.';
comment on table public.user_roles is
  'Source des rôles injectés dans le JWT par le Custom Access Token Hook.';

commit;

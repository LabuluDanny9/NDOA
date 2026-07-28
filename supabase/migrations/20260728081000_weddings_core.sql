begin;

create type public.wedding_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.wedding_member_role as enum (
  'owner',
  'planner',
  'editor',
  'viewer'
);

create type public.event_type as enum (
  'ceremony',
  'reception',
  'rehearsal',
  'civil',
  'religious',
  'other'
);

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete restrict,
  name text not null,
  slug text not null,
  partner_one_name text not null,
  partner_two_name text not null,
  wedding_date date,
  ceremony_time time,
  timezone text not null default 'Africa/Lubumbashi',
  status public.wedding_status not null default 'draft',
  published_at timestamptz,
  description text,
  theme jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weddings_name_length check (char_length(name) between 2 and 120),
  constraint weddings_partner_one_length
    check (char_length(partner_one_name) between 1 and 100),
  constraint weddings_partner_two_length
    check (char_length(partner_two_name) between 1 and 100),
  constraint weddings_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint weddings_slug_length check (char_length(slug) between 3 and 80),
  constraint weddings_version_positive check (version > 0),
  constraint weddings_publish_state check (
    (status = 'published' and published_at is not null)
    or status <> 'published'
  )
);

create unique index weddings_slug_unique on public.weddings (slug);
create index weddings_owner_status_idx
  on public.weddings (owner_id, status, updated_at desc);
create index weddings_date_idx
  on public.weddings (wedding_date)
  where status <> 'archived';

create table public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.wedding_member_role not null,
  invited_by uuid references public.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, user_id)
);

create unique index wedding_members_single_owner
  on public.wedding_members (wedding_id)
  where role = 'owner';
create index wedding_members_user_idx
  on public.wedding_members (user_id, wedding_id, role);
create index wedding_members_wedding_role_idx
  on public.wedding_members (wedding_id, role, user_id);
create index wedding_members_invited_by_idx
  on public.wedding_members (invited_by)
  where invited_by is not null;

create or replace function private.add_wedding_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wedding_members (wedding_id, user_id, role, invited_by)
  values (new.id, new.owner_id, 'owner', new.owner_id);
  return new;
end;
$$;

create trigger weddings_add_owner
after insert on public.weddings
for each row execute function private.add_wedding_owner();

create or replace function private.protect_wedding_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id <> old.owner_id then
    raise exception 'wedding owner cannot be changed directly'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger weddings_protect_owner
before update on public.weddings
for each row execute function private.protect_wedding_owner();

create or replace function private.protect_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE'
    and old.role = 'owner'
    and exists (
      select 1 from public.weddings where id = old.wedding_id
    )
  then
    raise exception 'owner membership cannot be deleted'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and (
    old.wedding_id <> new.wedding_id
    or old.user_id <> new.user_id
    or (old.role = 'owner' and new.role <> 'owner')
    or (old.role <> 'owner' and new.role = 'owner')
  ) then
    raise exception 'owner membership cannot be reassigned'
      using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger wedding_members_protect_owner
before update or delete on public.wedding_members
for each row execute function private.protect_owner_membership();

create or replace function private.is_wedding_member(
  target_wedding_id uuid,
  allowed_roles public.wedding_member_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wedding_members as member
    where member.wedding_id = target_wedding_id
      and member.user_id = (select auth.uid())
      and (allowed_roles is null or member.role = any(allowed_roles))
  );
$$;

create or replace function private.can_view_wedding(target_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or (select private.is_wedding_member(target_wedding_id));
$$;

create or replace function private.can_manage_wedding(target_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or (
      select private.is_wedding_member(
        target_wedding_id,
        array[
          'owner'::public.wedding_member_role,
          'planner'::public.wedding_member_role,
          'editor'::public.wedding_member_role
        ]
      )
    );
$$;

create or replace function private.can_own_wedding(target_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or (
      select private.is_wedding_member(
        target_wedding_id,
        array['owner'::public.wedding_member_role]
      )
    );
$$;

create or replace function private.shares_wedding_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wedding_members mine
    join public.wedding_members theirs
      on theirs.wedding_id = mine.wedding_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user_id
  );
$$;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  type public.event_type not null default 'other',
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  address text,
  city text,
  country text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  maps_url text,
  position integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  constraint events_title_length check (char_length(title) between 2 and 120),
  constraint events_time_order check (ends_at is null or ends_at > starts_at),
  constraint events_latitude_range
    check (latitude is null or latitude between -90 and 90),
  constraint events_longitude_range
    check (longitude is null or longitude between -180 and 180),
  constraint events_position_nonnegative check (position >= 0)
);

create index events_wedding_start_idx
  on public.events (wedding_id, starts_at, position);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  event_id uuid,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_minutes smallint,
  location text,
  position integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_event_wedding_fk
    foreign key (event_id, wedding_id)
    references public.events(id, wedding_id)
    on delete cascade,
  constraint programs_title_length
    check (char_length(title) between 2 and 120),
  constraint programs_duration_positive
    check (duration_minutes is null or duration_minutes > 0),
  constraint programs_position_nonnegative check (position >= 0)
);

create index programs_wedding_schedule_idx
  on public.programs (wedding_id, scheduled_at, position);
create index programs_event_idx on public.programs (event_id)
  where event_id is not null;

create trigger weddings_set_updated_at
before update on public.weddings
for each row execute function private.set_updated_at();

create trigger wedding_members_set_updated_at
before update on public.wedding_members
for each row execute function private.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function private.set_updated_at();

create trigger programs_set_updated_at
before update on public.programs
for each row execute function private.set_updated_at();

comment on table public.wedding_members is
  'Frontière multi-tenant; toute donnée métier est autorisée via cette table.';

commit;

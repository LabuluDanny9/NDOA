begin;

create type public.rsvp_response as enum (
  'pending',
  'accepted',
  'declined',
  'maybe'
);

create type public.invitation_status as enum (
  'draft',
  'queued',
  'sent',
  'delivered',
  'opened',
  'failed'
);

create type public.message_channel as enum (
  'email',
  'sms',
  'whatsapp',
  'in_app'
);

create type public.delivery_status as enum (
  'draft',
  'queued',
  'sending',
  'sent',
  'delivered',
  'failed',
  'cancelled'
);

create type public.qr_purpose as enum (
  'invitation',
  'rsvp',
  'check_in',
  'gift'
);

create table public.guest_groups (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  description text,
  color text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  unique (wedding_id, name),
  constraint guest_groups_name_length
    check (char_length(name) between 1 and 80),
  constraint guest_groups_color_format
    check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint guest_groups_position_nonnegative check (position >= 0)
);

create index guest_groups_wedding_position_idx
  on public.guest_groups (wedding_id, position, name);

create table public.guest_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  capacity smallint not null,
  shape text,
  location text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  unique (wedding_id, name),
  constraint guest_tables_name_length
    check (char_length(name) between 1 and 80),
  constraint guest_tables_capacity_positive check (capacity > 0),
  constraint guest_tables_position_nonnegative check (position >= 0)
);

create index guest_tables_wedding_position_idx
  on public.guest_tables (wedding_id, position, name);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  group_id uuid,
  table_id uuid,
  invited_by uuid references public.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  middle_name text,
  email text,
  phone text,
  city text,
  category text,
  language text not null default 'fr',
  allowed_companions smallint not null default 0,
  rsvp_status public.rsvp_response not null default 'pending',
  invitation_status public.invitation_status not null default 'draft',
  checked_in_at timestamptz,
  notes text,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  constraint guests_group_wedding_fk
    foreign key (group_id, wedding_id)
    references public.guest_groups(id, wedding_id)
    on delete set null (group_id),
  constraint guests_table_wedding_fk
    foreign key (table_id, wedding_id)
    references public.guest_tables(id, wedding_id)
    on delete set null (table_id),
  constraint guests_first_name_length
    check (char_length(first_name) between 1 and 100),
  constraint guests_last_name_length
    check (char_length(last_name) between 1 and 100),
  constraint guests_email_length
    check (email is null or char_length(email) <= 254),
  constraint guests_phone_length
    check (phone is null or char_length(phone) <= 32),
  constraint guests_allowed_companions_range
    check (allowed_companions between 0 and 20)
);

create index guests_wedding_name_idx
  on public.guests (wedding_id, last_name, first_name);
create index guests_wedding_rsvp_idx
  on public.guests (wedding_id, rsvp_status, invitation_status);
create index guests_group_idx on public.guests (group_id)
  where group_id is not null;
create index guests_table_idx on public.guests (table_id)
  where table_id is not null;
create index guests_email_idx on public.guests (wedding_id, lower(email))
  where email is not null;
create index guests_phone_idx on public.guests (wedding_id, phone)
  where phone is not null;
create index guests_invited_by_idx on public.guests (invited_by)
  where invited_by is not null;

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid not null,
  response public.rsvp_response not null,
  companions_count smallint not null default 0,
  companion_names text[] not null default '{}'::text[],
  comments text,
  dietary_requirements text,
  source text not null default 'web',
  responded_at timestamptz not null default now(),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guest_id),
  constraint rsvps_guest_wedding_fk
    foreign key (guest_id, wedding_id)
    references public.guests(id, wedding_id)
    on delete cascade,
  constraint rsvps_companions_range
    check (companions_count between 0 and 20),
  constraint rsvps_version_positive check (version > 0)
);

create index rsvps_wedding_response_idx
  on public.rsvps (wedding_id, response, responded_at desc);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  title text not null default 'Galerie',
  slug text not null default 'galerie',
  description text,
  is_public boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  unique (wedding_id, slug),
  constraint gallery_title_length
    check (char_length(title) between 1 and 100),
  constraint gallery_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint gallery_position_nonnegative check (position >= 0)
);

create index gallery_wedding_position_idx
  on public.gallery (wedding_id, position);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  gallery_id uuid not null,
  title text not null,
  description text,
  cover_photo_id uuid,
  is_public boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  constraint albums_gallery_wedding_fk
    foreign key (gallery_id, wedding_id)
    references public.gallery(id, wedding_id)
    on delete cascade,
  constraint albums_title_length
    check (char_length(title) between 1 and 100),
  constraint albums_position_nonnegative check (position >= 0)
);

create index albums_gallery_position_idx
  on public.albums (gallery_id, position);
create index albums_wedding_idx on public.albums (wedding_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  album_id uuid,
  uploaded_by uuid references public.users(id) on delete set null,
  storage_path text not null,
  thumbnail_path text,
  original_filename text,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  alt_text text,
  caption text,
  position integer not null default 0,
  is_public boolean not null default false,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, wedding_id),
  unique (storage_path),
  constraint photos_album_wedding_fk
    foreign key (album_id, wedding_id)
    references public.albums(id, wedding_id)
    on delete set null (album_id),
  constraint photos_storage_path_length
    check (char_length(storage_path) between 3 and 512),
  constraint photos_thumbnail_path_length
    check (thumbnail_path is null or char_length(thumbnail_path) <= 512),
  constraint photos_size_positive check (size_bytes > 0),
  constraint photos_width_positive check (width is null or width > 0),
  constraint photos_height_positive check (height is null or height > 0),
  constraint photos_position_nonnegative check (position >= 0)
);

alter table public.albums
  add constraint albums_cover_photo_fk
  foreign key (cover_photo_id, wedding_id)
  references public.photos(id, wedding_id)
  on delete set null (cover_photo_id);

create index photos_album_position_idx
  on public.photos (album_id, position)
  where album_id is not null;
create index photos_wedding_public_idx
  on public.photos (wedding_id, is_public, created_at desc);
create index photos_uploaded_by_idx on public.photos (uploaded_by)
  where uploaded_by is not null;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid,
  created_by uuid references public.users(id) on delete set null,
  channel public.message_channel not null,
  recipient text not null,
  subject text,
  body text not null,
  status public.delivery_status not null default 'draft',
  provider_message_id text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint messages_guest_wedding_fk
    foreign key (guest_id, wedding_id)
    references public.guests(id, wedding_id)
    on delete set null (guest_id),
  constraint messages_recipient_length
    check (char_length(recipient) between 1 and 254),
  constraint messages_body_length
    check (char_length(body) between 1 and 10000)
);

create index messages_wedding_status_idx
  on public.messages (wedding_id, status, scheduled_at);
create index messages_guest_idx on public.messages (guest_id)
  where guest_id is not null;
create unique index messages_provider_id_unique
  on public.messages (channel, provider_message_id)
  where provider_message_id is not null;
create index messages_created_by_idx on public.messages (created_by)
  where created_by is not null;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wedding_id uuid references public.weddings(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_length
    check (char_length(type) between 1 and 80),
  constraint notifications_title_length
    check (char_length(title) between 1 and 160)
);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;
create index notifications_wedding_idx
  on public.notifications (wedding_id, created_at desc)
  where wedding_id is not null;

create table public.gift_registry (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  external_url text,
  currency text not null default 'USD',
  unit_price numeric(12, 2),
  target_quantity integer not null default 1,
  purchased_quantity integer not null default 0,
  priority smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_registry_name_length
    check (char_length(name) between 1 and 160),
  constraint gift_registry_currency_format
    check (currency ~ '^[A-Z]{3}$'),
  constraint gift_registry_price_nonnegative
    check (unit_price is null or unit_price >= 0),
  constraint gift_registry_target_positive check (target_quantity > 0),
  constraint gift_registry_purchased_range
    check (
      purchased_quantity >= 0
      and purchased_quantity <= target_quantity
    )
);

create index gift_registry_wedding_active_idx
  on public.gift_registry (wedding_id, is_active, priority desc);

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid,
  purpose public.qr_purpose not null,
  token_hash bytea not null,
  token_hint text,
  expires_at timestamptz,
  usage_limit integer not null default 1,
  use_count integer not null default 0,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint qr_codes_guest_wedding_fk
    foreign key (guest_id, wedding_id)
    references public.guests(id, wedding_id)
    on delete cascade,
  constraint qr_codes_token_hash_unique unique (token_hash),
  constraint qr_codes_usage_limit_positive check (usage_limit > 0),
  constraint qr_codes_use_count_range
    check (use_count >= 0 and use_count <= usage_limit),
  constraint qr_codes_token_hint_length
    check (token_hint is null or char_length(token_hint) <= 12)
);

create index qr_codes_wedding_purpose_idx
  on public.qr_codes (wedding_id, purpose, created_at desc);
create index qr_codes_guest_idx on public.qr_codes (guest_id)
  where guest_id is not null;
create index qr_codes_active_expiry_idx on public.qr_codes (expires_at)
  where revoked_at is null;
create index qr_codes_created_by_idx on public.qr_codes (created_by)
  where created_by is not null;

create trigger guest_groups_set_updated_at
before update on public.guest_groups
for each row execute function private.set_updated_at();

create trigger guest_tables_set_updated_at
before update on public.guest_tables
for each row execute function private.set_updated_at();

create trigger guests_set_updated_at
before update on public.guests
for each row execute function private.set_updated_at();

create trigger rsvps_set_updated_at
before update on public.rsvps
for each row execute function private.set_updated_at();

create trigger gallery_set_updated_at
before update on public.gallery
for each row execute function private.set_updated_at();

create trigger albums_set_updated_at
before update on public.albums
for each row execute function private.set_updated_at();

create trigger photos_set_updated_at
before update on public.photos
for each row execute function private.set_updated_at();

create trigger messages_set_updated_at
before update on public.messages
for each row execute function private.set_updated_at();

create trigger gift_registry_set_updated_at
before update on public.gift_registry
for each row execute function private.set_updated_at();

comment on column public.qr_codes.token_hash is
  'Empreinte SHA-256 du jeton; le jeton brut ne doit jamais être stocké.';
comment on table public.messages is
  'File logique multicanal; aucun secret fournisseur n’est stocké ici.';

commit;

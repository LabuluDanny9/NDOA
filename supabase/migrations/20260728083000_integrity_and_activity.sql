begin;

create table public.activity_logs (
  id bigint generated always as identity primary key,
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint activity_logs_entity_type_length
    check (char_length(entity_type) between 1 and 80),
  constraint activity_logs_action_length
    check (char_length(action) between 1 and 80)
);

create index activity_logs_wedding_time_idx
  on public.activity_logs (wedding_id, occurred_at desc);
create index activity_logs_actor_time_idx
  on public.activity_logs (actor_user_id, occurred_at desc)
  where actor_user_id is not null;
create index activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, occurred_at desc)
  where entity_id is not null;

create or replace function private.validate_rsvp_companions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_count smallint;
begin
  select allowed_companions
  into allowed_count
  from public.guests
  where id = new.guest_id
    and wedding_id = new.wedding_id;

  if allowed_count is null then
    raise exception 'guest does not belong to wedding'
      using errcode = '23503';
  end if;

  if new.companions_count > allowed_count then
    raise exception 'companions count exceeds guest allowance'
      using errcode = '23514';
  end if;

  if cardinality(new.companion_names) > new.companions_count then
    raise exception 'companion names exceed companions count'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger rsvps_validate_companions
before insert or update of guest_id, wedding_id, companions_count, companion_names
on public.rsvps
for each row execute function private.validate_rsvp_companions();

create or replace function private.sync_guest_rsvp_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.guests
    set rsvp_status = 'pending'
    where id = old.guest_id and wedding_id = old.wedding_id;
    return old;
  end if;

  update public.guests
  set rsvp_status = new.response
  where id = new.guest_id and wedding_id = new.wedding_id;
  return new;
end;
$$;

create trigger rsvps_sync_guest_status
after insert or update of response or delete on public.rsvps
for each row execute function private.sync_guest_rsvp_status();

create or replace function private.write_activity_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  target_wedding_id uuid;
  target_entity_id uuid;
begin
  row_data := case
    when tg_op = 'DELETE' then to_jsonb(old)
    else to_jsonb(new)
  end;

  target_wedding_id := case
    when tg_table_name = 'weddings'
      then (row_data ->> 'id')::uuid
    else (row_data ->> 'wedding_id')::uuid
  end;

  target_entity_id := nullif(row_data ->> 'id', '')::uuid;

  if tg_op = 'DELETE' and not exists (
    select 1 from public.weddings where id = target_wedding_id
  ) then
    return old;
  end if;

  if target_wedding_id is not null then
    insert into public.activity_logs (
      wedding_id,
      actor_user_id,
      entity_type,
      entity_id,
      action,
      metadata
    )
    values (
      target_wedding_id,
      auth.uid(),
      tg_table_name,
      target_entity_id,
      lower(tg_op),
      jsonb_build_object('schema', tg_table_schema)
    );
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger weddings_activity
after insert or update or delete on public.weddings
for each row execute function private.write_activity_log();

create trigger wedding_members_activity
after insert or update or delete on public.wedding_members
for each row execute function private.write_activity_log();

create trigger events_activity
after insert or update or delete on public.events
for each row execute function private.write_activity_log();

create trigger programs_activity
after insert or update or delete on public.programs
for each row execute function private.write_activity_log();

create trigger guests_activity
after insert or update or delete on public.guests
for each row execute function private.write_activity_log();

create trigger rsvps_activity
after insert or update or delete on public.rsvps
for each row execute function private.write_activity_log();

create trigger gallery_activity
after insert or update or delete on public.gallery
for each row execute function private.write_activity_log();

create trigger albums_activity
after insert or update or delete on public.albums
for each row execute function private.write_activity_log();

create trigger photos_activity
after insert or update or delete on public.photos
for each row execute function private.write_activity_log();

create trigger messages_activity
after insert or update or delete on public.messages
for each row execute function private.write_activity_log();

create trigger gift_registry_activity
after insert or update or delete on public.gift_registry
for each row execute function private.write_activity_log();

comment on table public.activity_logs is
  'Journal append-only sans instantané de données personnelles.';

commit;

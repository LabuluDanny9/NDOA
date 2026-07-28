begin;

create or replace function public.submit_public_rsvp(
  target_slug text,
  guest_full_name text,
  guest_email text,
  target_response public.rsvp_response,
  target_companions_count smallint default 0,
  target_comments text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_wedding public.weddings%rowtype;
  target_guest public.guests%rowtype;
  saved_rsvp public.rsvps%rowtype;
  normalized_name text := regexp_replace(lower(trim(guest_full_name)), '\s+', ' ', 'g');
  normalized_email text := lower(trim(guest_email));
begin
  if char_length(normalized_name) < 2 or char_length(normalized_name) > 200 then
    raise exception 'invalid guest name' using errcode = '22023';
  end if;

  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid guest email' using errcode = '22023';
  end if;

  if target_companions_count < 0 or target_companions_count > 20 then
    raise exception 'invalid companions count' using errcode = '22023';
  end if;

  if target_comments is not null and char_length(target_comments) > 5000 then
    raise exception 'comments are too long' using errcode = '22023';
  end if;

  select *
  into target_wedding
  from public.weddings
  where slug = lower(trim(target_slug))
    and status = 'published';

  if not found then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;

  select *
  into target_guest
  from public.guests
  where wedding_id = target_wedding.id
    and email is not null
    and lower(email) = normalized_email
  limit 1;

  if not found then
    raise exception 'guest not found' using errcode = 'P0002';
  end if;

  if normalized_name <> regexp_replace(lower(trim(target_guest.first_name || ' ' || target_guest.last_name)), '\s+', ' ', 'g') then
    raise exception 'guest not found' using errcode = 'P0002';
  end if;

  insert into public.rsvps (
    wedding_id,
    guest_id,
    response,
    companions_count,
    comments,
    source,
    responded_at
  )
  values (
    target_wedding.id,
    target_guest.id,
    target_response,
    target_companions_count,
    nullif(trim(target_comments), ''),
    'web',
    now()
  )
  on conflict (guest_id) do update
    set response = excluded.response,
        companions_count = excluded.companions_count,
        comments = excluded.comments,
        source = excluded.source,
        responded_at = excluded.responded_at,
        version = public.rsvps.version + 1,
        updated_at = now()
  returning * into saved_rsvp;

  return jsonb_build_object(
    'id', saved_rsvp.id,
    'response', saved_rsvp.response,
    'companionsCount', saved_rsvp.companions_count,
    'respondedAt', saved_rsvp.responded_at
  );
end;
$$;

revoke all on function public.submit_public_rsvp(text, text, text, public.rsvp_response, smallint, text) from public;
grant execute on function public.submit_public_rsvp(text, text, text, public.rsvp_response, smallint, text) to anon, authenticated;

comment on function public.submit_public_rsvp(text, text, text, public.rsvp_response, smallint, text) is
  'Idempotent public RSVP for a published invitation; matches a preloaded guest and never returns guest contact data.';

commit;

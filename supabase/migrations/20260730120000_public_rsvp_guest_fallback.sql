begin;

drop function if exists public.submit_public_rsvp(text, text, text, public.rsvp_response, smallint, text);
drop function if exists public.submit_public_rsvp(text, text, text, public.rsvp_response, integer, text);

create or replace function public.submit_public_rsvp(
  target_slug text,
  guest_first_name text,
  guest_last_name text,
  guest_phone text,
  target_response public.rsvp_response,
  target_companions_count integer default 0,
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
  normalized_first_name text := regexp_replace(trim(guest_first_name), '\s+', ' ', 'g');
  normalized_last_name text := regexp_replace(trim(guest_last_name), '\s+', ' ', 'g');
  normalized_phone text := regexp_replace(trim(guest_phone), '[^\d+]', '', 'g');
begin
  if char_length(normalized_first_name) < 2 or char_length(normalized_first_name) > 100 then
    raise exception 'invalid guest name' using errcode = '22023';
  end if;

  if char_length(normalized_last_name) < 2 or char_length(normalized_last_name) > 100 then
    raise exception 'invalid guest name' using errcode = '22023';
  end if;

  if char_length(normalized_phone) < 6 or char_length(normalized_phone) > 32 then
    raise exception 'invalid guest phone' using errcode = '22023';
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
    and phone is not null
    and regexp_replace(phone, '[^\d+]', '', 'g') = normalized_phone
  limit 1;

  if not found then
    insert into public.guests (
      wedding_id,
      first_name,
      last_name,
      phone,
      allowed_companions,
      rsvp_status,
      invitation_status,
      language,
      notes,
      tags
    )
    values (
      target_wedding.id,
      normalized_first_name,
      normalized_last_name,
      normalized_phone,
      target_companions_count,
      target_response,
      'opened',
      'fr',
      nullif(trim(target_comments), ''),
      array['rsvp-public']
    )
    returning * into target_guest;
  else
    update public.guests
    set first_name = normalized_first_name,
        last_name = normalized_last_name,
        phone = normalized_phone,
        rsvp_status = target_response,
        invitation_status = 'opened',
        allowed_companions = greatest(allowed_companions, target_companions_count),
        notes = coalesce(nullif(trim(target_comments), ''), notes),
        updated_at = now()
    where id = target_guest.id
    returning * into target_guest;
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

revoke all on function public.submit_public_rsvp from public;
grant execute on function public.submit_public_rsvp to anon, authenticated;

comment on function public.submit_public_rsvp is
  'Idempotent public RSVP for a published invitation; updates a known guest or creates a public RSVP guest without returning contact data.';

commit;

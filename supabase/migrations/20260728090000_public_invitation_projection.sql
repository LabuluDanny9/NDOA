begin;

-- Public invitations are exposed through one reviewed projection instead of
-- granting anonymous access to the underlying tenant tables.
create or replace function public.get_public_invitation(target_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'id', wedding.id,
      'slug', wedding.slug,
      'name', wedding.name,
      'partnerOneName', wedding.partner_one_name,
      'partnerTwoName', wedding.partner_two_name,
      'weddingDate', wedding.wedding_date,
      'ceremonyTime', wedding.ceremony_time,
      'timezone', wedding.timezone,
      'description', wedding.description,
      'theme', jsonb_build_object(
        'primaryColor', wedding.theme ->> 'primaryColor',
        'secondaryColor', wedding.theme ->> 'secondaryColor',
        'textColor', wedding.theme ->> 'textColor',
        'font', wedding.theme ->> 'font',
        'style', wedding.theme ->> 'style'
      ),
      'settings', jsonb_build_object(
        'slogan', wedding.settings ->> 'slogan',
        'venueName', wedding.settings ->> 'venueName',
        'address', wedding.settings ->> 'address',
        'city', wedding.settings ->> 'city',
        'country', wedding.settings ->> 'country',
        'gpsCoordinates', wedding.settings ->> 'gpsCoordinates',
        'mapsLink', wedding.settings ->> 'mapsLink',
        'musicSource', wedding.settings ->> 'musicSource'
      ),
      'events', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', event.id,
          'type', event.type,
          'title', event.title,
          'description', event.description,
          'startsAt', event.starts_at,
          'endsAt', event.ends_at,
          'venueName', event.venue_name,
          'address', event.address,
          'city', event.city,
          'country', event.country,
          'mapsUrl', event.maps_url,
          'isPublic', event.is_public
        ) order by event.starts_at, event.position)
        from public.events as event
        where event.wedding_id = wedding.id and event.is_public
      ), '[]'::jsonb),
      'programs', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', program.id,
          'eventId', program.event_id,
          'title', program.title,
          'description', program.description,
          'scheduledAt', program.scheduled_at,
          'durationMinutes', program.duration_minutes,
          'location', program.location,
          'isPublic', program.is_public
        ) order by program.scheduled_at, program.position)
        from public.programs as program
        where program.wedding_id = wedding.id and program.is_public
      ), '[]'::jsonb),
      'photos', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', photo.id,
          'storagePath', photo.storage_path,
          'thumbnailPath', photo.thumbnail_path,
          'altText', photo.alt_text,
          'caption', photo.caption
        ) order by photo.position, photo.created_at)
        from public.photos as photo
        where photo.wedding_id = wedding.id and photo.is_public
      ), '[]'::jsonb),
      'gifts', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', gift.id,
          'name', gift.name,
          'description', gift.description,
          'imageUrl', gift.image_url,
          'externalUrl', gift.external_url,
          'currency', gift.currency,
          'unitPrice', gift.unit_price,
          'targetQuantity', gift.target_quantity,
          'purchasedQuantity', gift.purchased_quantity
        ) order by gift.priority, gift.created_at)
        from public.gift_registry as gift
        where gift.wedding_id = wedding.id and gift.is_active
      ), '[]'::jsonb)
    )
    from public.weddings as wedding
    where wedding.slug = target_slug and wedding.status = 'published'
  ), '{}'::jsonb);
$$;

revoke all on function public.get_public_invitation(text) from public;
grant execute on function public.get_public_invitation(text) to anon, authenticated;

comment on function public.get_public_invitation(text) is
  'Safe public projection for a published invitation; never returns guests, RSVP, messages, notifications or audit data.';

commit;

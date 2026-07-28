begin;

select plan(45);

select ok(
  to_regclass(format('public.%I', table_name)) is not null,
  format('table public.%I exists', table_name)
)
from unnest(array[
  'users',
  'profiles',
  'user_roles',
  'weddings',
  'wedding_members',
  'events',
  'programs',
  'guests',
  'guest_groups',
  'guest_tables',
  'gallery',
  'albums',
  'photos',
  'rsvps',
  'messages',
  'notifications',
  'gift_registry',
  'qr_codes',
  'activity_logs'
]) as table_name;

select ok(
  coalesce((
    select class.relrowsecurity
    from pg_class class
    join pg_namespace namespace on namespace.oid = class.relnamespace
    where namespace.nspname = 'public'
      and class.relname = table_name
  ), false),
  format('RLS is enabled on public.%I', table_name)
)
from unnest(array[
  'users',
  'profiles',
  'user_roles',
  'weddings',
  'wedding_members',
  'events',
  'programs',
  'guests',
  'guest_groups',
  'guest_tables',
  'gallery',
  'albums',
  'photos',
  'rsvps',
  'messages',
  'notifications',
  'gift_registry',
  'qr_codes',
  'activity_logs'
]) as table_name;

select ok(
  exists (
    select 1
    from storage.buckets
    where id = 'wedding-media'
  ),
  'wedding-media bucket exists'
);

select ok(
  (
    select not "public"
    from storage.buckets
    where id = 'wedding-media'
  ),
  'wedding-media bucket is private'
);

select ok(
  (
    select file_size_limit = 15728640
    from storage.buckets
    where id = 'wedding-media'
  ),
  'wedding-media bucket has a 15 MiB limit'
);

select ok(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and 'anon' = any(roles)
  ),
  'no public business table grants an anon policy'
);

select ok(
  not exists (
    select 1
    from unnest(array[
      'wedding_members',
      'events',
      'programs',
      'guests',
      'guest_groups',
      'guest_tables',
      'gallery',
      'albums',
      'photos',
      'rsvps',
      'messages',
      'gift_registry',
      'qr_codes',
      'activity_logs'
    ]) as required_table
    where not exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = required_table
        and indexdef ilike '%wedding_id%'
    )
  ),
  'every wedding-scoped table has an index containing wedding_id'
);

select ok(
  to_regprocedure('public.get_public_invitation(text)') is not null,
  'public invitation projection exists'
);

select ok(
  to_regprocedure('public.submit_public_rsvp(text, text, text, public.rsvp_response, smallint, text)') is not null,
  'public RSVP function exists'
);

select * from finish();

rollback;

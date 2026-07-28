begin;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.events enable row level security;
alter table public.programs enable row level security;
alter table public.guest_groups enable row level security;
alter table public.guest_tables enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.gallery enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.gift_registry enable row level security;
alter table public.qr_codes enable row level security;
alter table public.activity_logs enable row level security;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.users, public.user_roles, public.activity_logs
  to authenticated;

grant select on public.profiles to authenticated;
grant update (
  display_name,
  first_name,
  last_name,
  phone,
  avatar_path,
  city,
  country,
  locale,
  timezone,
  onboarding_completed
) on public.profiles to authenticated;

grant select, insert, update, delete on
  public.weddings,
  public.wedding_members,
  public.events,
  public.programs,
  public.guest_groups,
  public.guest_tables,
  public.guests,
  public.rsvps,
  public.gallery,
  public.albums,
  public.photos,
  public.messages,
  public.gift_registry,
  public.qr_codes
to authenticated;

grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

revoke all on all functions in schema private
  from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_wedding_member(
  uuid,
  public.wedding_member_role[]
) to authenticated;
grant execute on function private.can_view_wedding(uuid) to authenticated;
grant execute on function private.can_manage_wedding(uuid) to authenticated;
grant execute on function private.can_own_wedding(uuid) to authenticated;
grant execute on function private.shares_wedding_with(uuid) to authenticated;

create policy users_select_self_or_admin
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy profiles_select_team
on public.profiles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
  or (select private.shares_wedding_with(user_id))
);

create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy user_roles_select_self_or_admin
on public.user_roles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy weddings_select_members
on public.weddings
for select
to authenticated
using ((select private.can_view_wedding(id)));

create policy weddings_insert_owner
on public.weddings
for insert
to authenticated
with check (
  (
    owner_id = (select auth.uid())
    and (select private.current_app_role()) in ('admin', 'organizer')
  )
  or (select private.is_admin())
);

create policy weddings_update_managers
on public.weddings
for update
to authenticated
using ((select private.can_manage_wedding(id)))
with check ((select private.can_manage_wedding(id)));

create policy weddings_delete_owners
on public.weddings
for delete
to authenticated
using ((select private.can_own_wedding(id)));

create policy wedding_members_select_members
on public.wedding_members
for select
to authenticated
using ((select private.can_view_wedding(wedding_id)));

create policy wedding_members_insert_managers
on public.wedding_members
for insert
to authenticated
with check (
  (
    (
      select private.is_wedding_member(
        wedding_id,
        array[
          'owner'::public.wedding_member_role,
          'planner'::public.wedding_member_role
        ]
      )
    )
    and role <> 'owner'
  )
  or (select private.is_admin())
);

create policy wedding_members_update_managers
on public.wedding_members
for update
to authenticated
using (
  (
    select private.is_wedding_member(
      wedding_id,
      array[
        'owner'::public.wedding_member_role,
        'planner'::public.wedding_member_role
      ]
    )
  )
  or (select private.is_admin())
)
with check (
  (
    (
      select private.is_wedding_member(
        wedding_id,
        array[
          'owner'::public.wedding_member_role,
          'planner'::public.wedding_member_role
        ]
      )
    )
    and role <> 'owner'
  )
  or (select private.is_admin())
);

create policy wedding_members_delete_managers
on public.wedding_members
for delete
to authenticated
using (
  (
    (
      select private.is_wedding_member(
        wedding_id,
        array[
          'owner'::public.wedding_member_role,
          'planner'::public.wedding_member_role
        ]
      )
    )
    and role <> 'owner'
  )
  or (select private.is_admin())
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'events',
    'programs',
    'guest_groups',
    'guest_tables',
    'guests',
    'rsvps',
    'gallery',
    'albums',
    'photos',
    'messages',
    'gift_registry',
    'qr_codes'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.can_view_wedding(wedding_id)))',
      table_name || '_select_members',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.can_manage_wedding(wedding_id)))',
      table_name || '_insert_managers',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.can_manage_wedding(wedding_id))) with check ((select private.can_manage_wedding(wedding_id)))',
      table_name || '_update_managers',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.can_manage_wedding(wedding_id)))',
      table_name || '_delete_managers',
      table_name
    );
  end loop;
end
$$;

create policy notifications_select_recipient
on public.notifications
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy notifications_mark_read
on public.notifications
for update
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy activity_logs_select_managers
on public.activity_logs
for select
to authenticated
using ((select private.can_manage_wedding(wedding_id)));

create or replace function private.storage_wedding_id(object_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return nullif(split_part(object_name, '/', 1), '')::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke all on function private.storage_wedding_id(text)
  from public, anon;
grant execute on function private.storage_wedding_id(text)
  to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'wedding-media',
  'wedding-media',
  false,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy wedding_media_select_members
on storage.objects
for select
to authenticated
using (
  bucket_id = 'wedding-media'
  and (
    select private.can_view_wedding(
      private.storage_wedding_id(name)
    )
  )
);

create policy wedding_media_insert_managers
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wedding-media'
  and (
    select private.can_manage_wedding(
      private.storage_wedding_id(name)
    )
  )
);

create policy wedding_media_update_managers
on storage.objects
for update
to authenticated
using (
  bucket_id = 'wedding-media'
  and (
    select private.can_manage_wedding(
      private.storage_wedding_id(name)
    )
  )
)
with check (
  bucket_id = 'wedding-media'
  and (
    select private.can_manage_wedding(
      private.storage_wedding_id(name)
    )
  )
);

create policy wedding_media_delete_managers
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wedding-media'
  and (
    select private.can_manage_wedding(
      private.storage_wedding_id(name)
    )
  )
);

comment on policy wedding_media_insert_managers on storage.objects is
  'Le premier segment du chemin doit être le wedding_id autorisé.';

commit;

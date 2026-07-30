begin;

grant update (status) on public.users to authenticated;
grant insert, update, delete on public.user_roles to authenticated;

create policy users_admin_update
on public.users
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy user_roles_admin_insert
on public.user_roles
for insert
to authenticated
with check ((select private.is_admin()));

create policy user_roles_admin_update
on public.user_roles
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy user_roles_admin_delete
on public.user_roles
for delete
to authenticated
using ((select private.is_admin()));

comment on policy users_admin_update on public.users is
  'Only the signed admin JWT claim can suspend or reactivate an account.';
comment on policy user_roles_admin_update on public.user_roles is
  'Only administrators can assign application roles.';

commit;

begin;

-- Public invitations need to display organizer-uploaded photos without
-- exposing the whole private wedding-media bucket. This policy lets anonymous
-- visitors read only files that are attached to published weddings and marked
-- public in the photos table.
create policy wedding_media_select_public_invitations
on storage.objects
for select
to anon
using (
  bucket_id = 'wedding-media'
  and exists (
    select 1
    from public.photos as photo
    join public.weddings as wedding
      on wedding.id = photo.wedding_id
    where photo.storage_path = storage.objects.name
      and photo.is_public
      and wedding.status = 'published'
  )
);

comment on policy wedding_media_select_public_invitations on storage.objects is
  'Allows public invitation pages to generate signed URLs for public photos belonging to published weddings only.';

commit;

begin;

-- Les objets internes ne doivent jamais être exposés par la Data API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Les futures tables et fonctions restent privées jusqu'à l'ajout explicite
-- de GRANT et de politiques RLS dans une migration versionnée.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

commit;

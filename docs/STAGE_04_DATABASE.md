# Étape 4 — Base de données multi-tenant

Date : 28 juillet 2026  
Branche : `codex/04-database-schema`

## Résultat

Le schéma Supabase de NDOA est versionné en cinq migrations progressives :

| Migration | Responsabilité |
|---|---|
| `20260728080000_identity_and_roles.sql` | comptes publics, profils, rôle unique, trigger `auth.users`, Auth Hook |
| `20260728081000_weddings_core.sql` | mariages, membres, événements, programmes, fonctions de tenant |
| `20260728082000_wedding_domains.sql` | invités, RSVP, galerie, messages, notifications, cadeaux et QR |
| `20260728083000_integrity_and_activity.sql` | cohérence RSVP et journal append-only |
| `20260728084000_row_level_security.sql` | grants minimaux, policies RLS et Storage |

## Tables

Les 19 tables demandées sont présentes :

```text
users, profiles, weddings, events, programs, guests, guest_groups,
guest_tables, gallery, albums, photos, rsvps, messages, notifications,
gift_registry, qr_codes, activity_logs
```

Deux tables structurelles complètent le modèle :

- `user_roles` : un rôle applicatif unique par compte ;
- `wedding_members` : appartenance et rôle propres à chaque mariage.

`public.users` ne duplique ni mot de passe ni secret : sa clé primaire
référence `auth.users(id)` avec suppression en cascade. Un trigger
`security definer set search_path = ''` crée le compte public, le profil et le
rôle `organizer`.

## Intégrité

- identifiants UUID et clés étrangères explicites ;
- suppression en cascade uniquement à partir du tenant ou de l’identité ;
- propriétaire de mariage et membre `owner` immuables ;
- un seul propriétaire et un seul rôle applicatif par utilisateur ;
- clés étrangères composites pour interdire les rattachements inter-mariages ;
- dates de fin d’événement postérieures aux dates de début ;
- capacité, quantités, compagnons, dimensions et compteurs bornés ;
- réponse RSVP synchronisée vers l’invité par trigger ;
- nombre d’accompagnants limité par l’autorisation de l’invité ;
- jetons QR stockés uniquement sous forme d’empreinte `bytea` ;
- journal d’activité sans copie des coordonnées ou du contenu métier.

Toutes les clés étrangères utilisées pour les suppressions et toutes les
colonnes de tenant utilisées par RLS possèdent un index adapté.

## RLS

RLS est activée sur chaque table du schéma `public`.

| Ressource | Lecture | Écriture |
|---|---|---|
| `users`, `user_roles` | soi-même ou admin | système uniquement |
| `profiles` | soi-même, admin ou même équipe | soi-même/admin, colonnes autorisées |
| `weddings` | membres/admin | gestionnaires ; suppression owner/admin |
| `wedding_members` | membres/admin | owner/planner, sans réaffecter owner |
| tables métier | membres/admin | owner/planner/editor/admin |
| `notifications` | destinataire/admin | destinataire : `read_at` uniquement |
| `activity_logs` | gestionnaires/admin | triggers uniquement |

Aucune policy `anon` n’existe à cette étape. La future invitation publique
passera par une projection et des fonctions dédiées, sans exposer les tables
contenant les coordonnées des invités.

Les fonctions d’autorisation sont dans le schéma `private`, absent des schémas
Data API :

```text
current_app_role
is_admin
is_wedding_member
can_view_wedding
can_manage_wedding
can_own_wedding
shares_wedding_with
storage_wedding_id
```

Elles sont `stable`, `security definer`, utilisent des noms qualifiés et un
`search_path` vide.

## Storage

Le bucket `wedding-media` est :

- privé ;
- limité à 15 MiB par objet ;
- limité à JPEG, PNG, WebP et AVIF ;
- organisé sous `<wedding_id>/...`.

Les policies `storage.objects` extraient le premier segment du chemin. Un
membre peut lire ; seuls owner/planner/editor/admin peuvent créer, remplacer
ou supprimer.

## Rôles JWT

Le Custom Access Token Hook lit `user_roles` et ajoute le claim signé
`user_role`. Il est activé localement par :

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

Sur un projet hébergé, sélectionner aussi la fonction dans
**Authentication → Hooks → Custom Access Token**. Un changement de rôle exige
ensuite un renouvellement de session.

## Types et tests

`types/database.types.ts` versionne le contrat complet des lignes, insertions,
mises à jour, fonctions et enums. `npm run supabase:types` écrit dans un
fichier `.generated.ts` séparé afin de ne pas tronquer le contrat courant en
cas d’échec.

Tests disponibles :

- 46 contrôles Vitest ciblés sur l’inventaire, RLS, sécurité QR, Auth Hook et
  types d’insertion ;
- 43 assertions pgTAP sur les tables, RLS, index, absence de policy anonyme et
  bucket privé ;
- job CI `database` : démarrage Supabase, lint PostgreSQL et pgTAP.

## Limite d’exécution locale

La configuration TOML est acceptée par la CLI Supabase `2.110.0`. La machine
Windows 10 Pro ne possède toutefois ni Docker/Podman, ni WSL, ni `winget`.
L’activation de WSL/Docker modifierait les composants Windows et demanderait
probablement un redémarrage ; elle n’a pas été déclenchée implicitement.

Par conséquent, les migrations, `supabase db lint`, pgTAP et la régénération
réelle des types doivent encore être exécutés sur un moteur Supabase. Il ne
faut pas ouvrir l’étape 5 tant que ce contrôle connecté n’est pas vert.

Commandes à exécuter après installation de Docker Desktop ou Podman :

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:lint
npm run supabase:test
npm run supabase:types
```

## Références

- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase — Custom Claims and RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)
- [Supabase — Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase — Testing and linting](https://supabase.com/docs/guides/local-development/cli/testing-and-linting)
- [PostgreSQL 17 — Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)

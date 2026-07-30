# NDOA

NDOA est une application Next.js de gestion de mariages et d’invitations
numériques. Le dépôt contient une fondation UI stabilisée et une couche
Supabase SSR avec schéma multi-tenant versionné :
landing page, tableau de bord de démonstration, assistant de création de
mariage, gestion locale des invités et invitation publique.

L’authentification, les frontières RLS et les premiers endpoints REST métier
sont présents. Les écrans spécialisés restent progressivement connectés dans
les étapes suivantes.

## Prérequis

- Node.js 20 ou plus récent ;
- npm 10 ou plus récent ;
- Git ;
- Chromium Playwright pour les tests E2E.
- Docker Desktop ou Podman uniquement pour la pile Supabase locale.

## Installation

```bash
npm ci
copy .env.example .env.local
npx playwright install chromium
npm run dev
```

L’application est disponible sur [http://localhost:3000](http://localhost:3000).

## Commandes

```bash
npm run dev          # serveur de développement
npm run lint         # ESLint
npm run typecheck    # TypeScript sans émission
npm test             # tests unitaires Vitest
npm run test:watch   # Vitest en mode interactif
npm run test:e2e     # tests Playwright
npm run build        # build de production Next.js
npm run check        # lint + typecheck + tests unitaires + build
npm run supabase:start   # démarre la pile locale (Docker/Podman requis)
npm run supabase:status  # affiche URL et clés locales
npm run supabase:reset   # rejoue migrations et seed
npm run supabase:lint    # analyse le schéma PostgreSQL
npm run supabase:test    # tests pgTAP du schéma et de RLS
npm run supabase:validate # validation PostgreSQL WASM + smoke test RLS
npm run supabase:types   # génère un fichier de types à examiner
```

## Routes principales

| Route | État |
|---|---|
| `/` | Landing page |
| `/dashboard` | Espace organisateur protégé quand Supabase est configuré |
| `/dashboard/create-wedding` | Assistant de création local |
| `/dashboard/guests` | CRUD local, recherche, filtres et CSV |
| `/invitation/[slug]` | Invitation publique de démonstration |
| `/login`, `/register` | Connexion et inscription Supabase |
| `/forgot-password`, `/reset-password` | Récupération de compte |
| `/admin` | Espace réservé au claim `admin` |
| `/guest` | Espace réservé au claim `guest` |
| `/api/health` | Readiness sans secret pour supervision et déploiement |

Les collections REST sont documentées dans
[`docs/STAGE_05_API.md`](docs/STAGE_05_API.md) : mariages, événements,
programme, invités, groupes et tables avec pagination, recherche et enveloppe
d’erreur homogène.

## Architecture

```text
app/                    routes Next.js App Router
components/
  dashboard/            shell et surfaces du tableau de bord
  guests/               domaine invités local + codec CSV
  home/                 landing page
  invitation/           invitation publique
  shared/               états partagés
  ui/                   primitives UI
  wedding/              formulaire multi-étapes + schéma Zod
lib/                    utilitaires transversaux
  supabase/             environnement, clients SSR et proxy de session
supabase/               configuration, migrations et seed locaux
  tests/database/        contrats pgTAP du schéma et de RLS
tests/
  unit/                 tests Vitest
  e2e/                  scénarios Playwright
docs/                   architecture, décisions et rapports d’étape
```

Les règles d’architecture et la trajectoire Supabase sont décrites dans
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Le compte rendu de la
stabilisation se trouve dans
[`docs/STAGE_01_FOUNDATION.md`](docs/STAGE_01_FOUNDATION.md).
La fondation Supabase est décrite dans
[`docs/STAGE_02_SUPABASE.md`](docs/STAGE_02_SUPABASE.md).
Les flux d’identité et les rôles sont décrits dans
[`docs/STAGE_03_AUTHENTICATION.md`](docs/STAGE_03_AUTHENTICATION.md).
Le schéma, les contraintes et les policies sont décrits dans
[`docs/STAGE_04_DATABASE.md`](docs/STAGE_04_DATABASE.md).
Les contrats REST sont décrits dans
[`docs/STAGE_05_API.md`](docs/STAGE_05_API.md).
Le cycle de vie des mariages est décrit dans
[`docs/STAGE_06_WEDDING.md`](docs/STAGE_06_WEDDING.md).
Le module invités, ses formats d’import/export et ses QR codes sont décrits
dans [`docs/STAGE_07_GUESTS.md`](docs/STAGE_07_GUESTS.md).
La projection publique et l’invitation par slug sont décrites dans
[`docs/STAGE_08_INVITATION.md`](docs/STAGE_08_INVITATION.md).
Le flux RSVP public et son RPC idempotent sont décrits dans
[`docs/STAGE_09_RSVP.md`](docs/STAGE_09_RSVP.md).
Le dashboard KPI, ses agrégats et ses graphiques sont décrits dans
[`docs/STAGE_10_DASHBOARD.md`](docs/STAGE_10_DASHBOARD.md).
La galerie privée, son upload compressé et ses URLs signées sont décrits dans
[`docs/STAGE_11_GALLERY.md`](docs/STAGE_11_GALLERY.md).
La file de communication, les templates et les statuts de livraison sont décrits dans
[`docs/STAGE_12_NOTIFICATIONS.md`](docs/STAGE_12_NOTIFICATIONS.md).
Les contrôles d’administration, les permissions et le journal sont décrits dans
[`docs/STAGE_13_ADMIN.md`](docs/STAGE_13_ADMIN.md).
La finition production, les métadonnées publiques et la readiness sont décrites
dans [`docs/STAGE_14_PRODUCTION.md`](docs/STAGE_14_PRODUCTION.md).

## Variables d’environnement

Copier `.env.example` vers `.env.local`. Les deux variables Supabase doivent
être définies ensemble ou laissées vides. Une configuration partielle, une URL
non HTTP(S), une clé `sb_secret_*` ou `service_role` fait échouer explicitement
l’application. Ne jamais exposer une clé privée dans `NEXT_PUBLIC_*`.

Sans configuration Supabase, le dashboard reste consultable en mode
démonstration uniquement avec `NODE_ENV=development` ou `test`. En production,
le proxy refuse l’accès aux espaces protégés : le déploiement échoue donc
fermement au lieu d’exposer les données.

Les indicateurs de fournisseurs visibles dans l’administration et `/api/health`
se pilotent avec `NDOA_EMAIL_PROVIDER_ENABLED`,
`NDOA_SMS_PROVIDER_ENABLED` et `NDOA_WHATSAPP_PROVIDER_ENABLED`. Ils n’exposent
aucun secret et servent à signaler les intégrations réellement raccordées.

## Qualité et CI

La CI GitHub exécute sur chaque push et pull request :

1. installation reproductible avec `npm ci` ;
2. ESLint ;
3. contrôle TypeScript ;
4. tests Vitest ;
5. build Next.js ;
6. tests E2E Chromium.

Une étape n’est terminée que si tous ces contrôles passent.

## Sécurité CSV

Les exports invités :

- échappent les virgules, guillemets et retours à la ligne ;
- neutralisent les cellules commençant par `=`, `+`, `-` ou `@` pour éviter
  l’exécution de formules dans un tableur ;
- limitent les imports à 2 Mo et 1 000 invités ;
- exigent les colonnes `lastName` et `firstName`.

Les données restent locales tant que Supabase n’est pas connecté.

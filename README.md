# NDOA

NDOA est une application Next.js de gestion de mariages et d’invitations
numériques. Le dépôt contient actuellement une fondation UI stabilisée :
landing page, tableau de bord de démonstration, assistant de création de
mariage, gestion locale des invités et invitation publique.

La persistance, l’authentification et l’isolation multi-tenant seront
introduites progressivement avec Supabase à partir de l’étape 2. Les pages qui
en dépendent indiquent explicitement qu’elles sont planifiées ; elles ne
simulent pas une connexion backend.

## Prérequis

- Node.js 20 ou plus récent ;
- npm 10 ou plus récent ;
- Git ;
- Chromium Playwright pour les tests E2E.

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
```

## Routes principales

| Route | État |
|---|---|
| `/` | Landing page |
| `/dashboard` | Tableau de bord de démonstration |
| `/dashboard/create-wedding` | Assistant de création local |
| `/dashboard/guests` | CRUD local, recherche, filtres et CSV |
| `/invitation/[slug]` | Invitation publique de démonstration |
| `/login`, `/register` | États préparatoires à l’authentification |

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
tests/
  unit/                 tests Vitest
  e2e/                  scénarios Playwright
docs/                   architecture, décisions et rapports d’étape
```

Les règles d’architecture et la trajectoire Supabase sont décrites dans
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Le compte rendu de la
stabilisation se trouve dans
[`docs/STAGE_01_FOUNDATION.md`](docs/STAGE_01_FOUNDATION.md).

## Variables d’environnement

Copier `.env.example` vers `.env.local`. Ne jamais exposer une clé privée dans
une variable `NEXT_PUBLIC_*`. Les variables Supabase seront ajoutées à l’étape
2 avec une validation typée.

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

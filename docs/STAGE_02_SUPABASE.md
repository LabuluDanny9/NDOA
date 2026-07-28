# Étape 2 — Fondation Supabase

Date : 28 juillet 2026  
Branche : `codex/02-supabase-foundation`

## Résultat

La couche Supabase est installée sans connecter prématurément les écrans aux
données métier :

- `@supabase/supabase-js` et `@supabase/ssr` sont des dépendances applicatives ;
- la CLI Supabase est une dépendance de développement verrouillée ;
- les variables publiques sont normalisées et validées avec Zod ;
- les clés `sb_secret_*`, les clés JWT `service_role` et les configurations
  partielles sont rejetées ;
- le client navigateur et le client serveur sont séparés et typés ;
- le client serveur est recréé par requête, sans état global partagé ;
- `proxy.ts` rafraîchit la session avec `auth.getClaims()` ;
- les cookies et en-têtes anti-cache de `@supabase/ssr` sont tous propagés ;
- la configuration locale, le seed et les migrations sont versionnés ;
- les privilèges futurs sont refusés par défaut aux rôles Data API.

## Environnement

Créer `.env.local` depuis `.env.example`, puis renseigner ensemble :

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Les clés publiques sont destinées au navigateur, mais chaque environnement
doit pointer vers son propre projet :

| Environnement Vercel | Projet Supabase recommandé |
|---|---|
| Development | Supabase local |
| Preview | Projet de staging |
| Production | Projet de production |

Dans Vercel, définir les variables séparément pour **Preview** et
**Production**, puis redéployer. Ne jamais créer de variable
`NEXT_PUBLIC_SUPABASE_SECRET_KEY` ou `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.
Une éventuelle clé serveur restera hors du bundle et ne sera ajoutée que si une
étape métier en démontre le besoin.

## Développement local

Docker Desktop ou Podman doit être installé et démarré :

```bash
npm run supabase:start
npm run supabase:status
npm run supabase:reset
npm run supabase:lint
npm run supabase:types
```

`supabase:types` écrit volontairement
`types/database.types.generated.ts` : le fichier importé
`types/database.types.ts` n’est ainsi jamais tronqué si la base locale est
indisponible. Examiner le diff, puis remplacer le fichier importé lors d’une
évolution de schéma validée.

Sur la machine auditée, la CLI `2.110.0` fonctionne, mais aucun moteur Docker
ou Podman n’est installé. La configuration a été parsée par la CLI avant son
arrêt sur cette dépendance externe. Le démarrage de la pile, le lint SQL
connecté et la régénération effective des types restent donc à exécuter dès
qu’un moteur de conteneurs est disponible.

## Migration initiale

`20260728070000_foundation_security.sql` :

- crée un schéma `private` non exposé ;
- retire son accès à `public`, `anon` et `authenticated` ;
- retire par défaut les privilèges sur les futures tables, séquences et
  fonctions publiques ;
- oblige les prochaines migrations à accorder explicitement le strict
  nécessaire et à définir leurs politiques RLS.

Les tables métier et leurs politiques appartiennent à l’étape 4.

## Références

- [Supabase SSR — création des clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase SSR — concepts avancés](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Supabase CLI — développement local](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase — génération des types TypeScript](https://supabase.com/docs/guides/api/rest/generating-types)
- [Vercel — variables d’environnement](https://vercel.com/docs/environment-variables)

## Barrières de sortie

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
git diff --check
```

Les tests unitaires couvrent la configuration complète, vide, partielle,
l’URL invalide et le refus des clés secrètes.

# Étape 14 — Finition production et livraison

## Livré

- métadonnées Next.js complètes pour le titre, l’Open Graph, Twitter, le manifest et les icônes ;
- `manifest.webmanifest`, `robots.txt` et `sitemap.xml` générés depuis l’URL publique configurée ;
- headers de sécurité globaux : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` et `Permissions-Policy` ;
- route `/api/health` sans secret pour vérifier si l’application est prête ou dégradée ;
- indicateurs d’intégrations email, SMS et WhatsApp pilotés par variables serveur ;
- optimisation de l’image principale de démonstration pour le rendu initial.

## Critère de livraison

L’environnement client doit fournir `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Sans
Supabase, l’interface reste démontrable en développement, mais la route
`/api/health` renvoie `degraded` afin d’éviter une fausse validation de
production.

## Vérifications

Les tests E2E contrôlent les headers publics, le manifest, `robots.txt`,
`sitemap.xml` et la route de santé. La livraison reste validée par la chaîne
complète `npm run lint`, `npm run typecheck`, `npm test`,
`npm run supabase:validate`, `npm run test:e2e` et `npm run build`.

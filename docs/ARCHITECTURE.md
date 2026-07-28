# Architecture NDOA

## État actuel

NDOA utilise Next.js 16 avec l’App Router, React 19, TypeScript strict,
Tailwind CSS 4, Base UI/shadcn, React Hook Form, Zod et Framer Motion.

Les étapes 1 et 2 stabilisent le prototype et sa frontière backend :

- les routes publiques et dashboard ont des états explicites ;
- le formulaire mariage est typé et validé par étape ;
- le module invités fonctionne localement ;
- le CSV est borné, correctement encodé et protégé contre les formules ;
- l’invitation résout son slug côté serveur et produit un QR réel ;
- les barrières lint, types, tests, build et E2E sont présentes.
- l’environnement Supabase public est validé avant utilisation ;
- les clients navigateur et serveur sont séparés et typés ;
- le proxy Next.js rafraîchit les sessions avant le rendu ;
- la configuration et les migrations locales sont versionnées.

## Frontières de modules

```mermaid
flowchart LR
  App["App Router"] --> Public["Surface publique"]
  App --> Dashboard["Dashboard"]
  Dashboard --> Wedding["Domaine mariage"]
  Dashboard --> Guests["Domaine invités"]
  Public --> Invitation["Invitation publique"]
  Wedding --> LocalState["État local — étapes 1 à 3"]
  Guests --> LocalState
  LocalState -. "mutations métier — étape 5+" .-> Server["Couche serveur"]
  App --> Proxy["Proxy de session"]
  Proxy --> Supabase["Supabase Auth / DB / Storage"]
  Server --> Supabase
```

Les composants UI ne doivent pas accéder directement aux futurs clients
Supabase. Les lectures serveur et mutations seront placées derrière des
fonctions de domaine validées par Zod.

## Principes pour Supabase

L’étape 2 établit les éléments suivants avant toute persistance métier :

1. validation typée de l’environnement ;
2. client navigateur avec clé publique uniquement ;
3. client serveur utilisant les cookies de session ;
4. aucune clé `service_role` dans le bundle ou les variables publiques ;
5. types de base versionnés et commande de régénération reproductible ;
6. migrations locales reproductibles.

Le client serveur est créé par requête : aucun singleton global ne peut
partager une session entre deux exécutions Vercel. Le proxy appelle
`auth.getClaims()` avant le rendu, réécrit les cookies rafraîchis et transmet
les en-têtes `private, no-store` fournis par `@supabase/ssr`. Une absence
complète de configuration conserve temporairement le prototype local ; une
configuration partielle échoue.

L’étape 4 rendra l’isolation multi-tenant structurelle :

- `weddings` possède un propriétaire immuable ;
- `wedding_members` porte les collaborations et rôles locaux ;
- chaque table métier référence le mariage ;
- RLS est activée sur toutes les tables et tous les buckets exposés ;
- les tests doivent prouver qu’un utilisateur du mariage A ne peut ni lire ni
  modifier les données du mariage B.

## Frontière publique

Une invitation publiée ne doit exposer qu’une projection limitée : noms
affichés, date, programme, lieu, thème et médias publiés. Les coordonnées des
invités, réponses RSVP privées, identifiants internes et journaux ne doivent
jamais apparaître dans cette projection.

Les réponses RSVP et le check-in utiliseront des codes non devinables,
validation serveur, limitation de débit et opérations idempotentes.

## Conventions

- Server Components par défaut ; `"use client"` uniquement pour
  l’interactivité.
- Zod aux frontières de confiance.
- TypeScript strict, aucun `any` évitable.
- Les mutations vérifient l’identité, l’autorisation puis valident les données,
  dans cet ordre.
- Les listes utilisent des tris et filtres sur listes blanches.
- Les erreurs utilisateur sont stables et les détails techniques restent dans
  les logs serveur.
- Chaque étape dispose d’une branche dédiée et de commits atomiques.

# Étape 1 — Stabilisation de la fondation

Date : 28 juillet 2026  
Branche : `codex/01-foundation-stabilization`

## Analysé

- architecture complète du dépôt ;
- configuration Next.js, TypeScript, ESLint et Tailwind ;
- routes, liens et ressources publiques ;
- formulaire multi-étapes de mariage ;
- module invités et flux CSV ;
- invitation publique, partage et QR ;
- sécurité statique, accessibilité et dette de typage.

Le rapport d’audit détaillé est livré séparément dans l’espace de travail
Codex.

## Modifié

- ajout des scripts `lint`, `typecheck`, `test`, `test:e2e` et `check` ;
- ajout de Vitest, Testing Library, Playwright et `react-qr-code` ;
- correction de la racine Next.js et des métadonnées françaises ;
- résolution asynchrone du slug Next.js 16 ;
- QR code SVG réel et téléchargeable ;
- routes manquantes remplacées par des états honnêtes et stables ;
- états globaux loading, erreur et 404 ;
- toast accessible pour les mutations locales ;
- schéma Zod partagé du mariage et validation propre à chaque étape ;
- suppression des `any` dans le formulaire et des observations incompatibles
  avec React Compiler ;
- CRUD local invités, formulaire prérempli, duplication et suppression ;
- recherche, filtres, tri et pagination unifiés ;
- import/export CSV robuste et protection contre l’injection de formules ;
- composants invités inutilisés supprimés ;
- primitives bouton composées avec l’API Base UI ;
- CTA reliés aux routes réelles ;
- CI GitHub et documentation.

## Erreurs corrigées

- 33 erreurs et 24 avertissements ESLint initiaux ;
- URL d’invitation contenant `undefined` ;
- validation globale prématurée à l’étape Programme ;
- routes et images involontairement en 404 ;
- actions invités sans effet ou dupliquées ;
- CSV incorrect en présence de guillemets, virgules et retours à la ligne ;
- injection de formule CSV faible/P3 ;
- champs email vides rejetés ;
- boutons icône sans nom accessible ;
- usages de `<img>` non optimisés ;
- composant bouton `asChild` non typé.

## Contrôles

Les barrières de sortie sont :

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
git diff --check
```

Le résultat final de ces commandes doit être reporté dans le message de
livraison de l’étape.

## Limites assumées

- aucune authentification ou persistance n’est simulée ;
- les données du dashboard, du mariage et des invités restent locales ;
- les routes futures affichent un état « module planifié » ;
- Supabase commence seulement à l’étape 2 ;
- notifications email/SMS/WhatsApp, paiement et administration nécessiteront
  des décisions fournisseur et produit ultérieures.

## Prochaine étape

Étape 2 — Fondation Supabase : dépendances SSR, validation de l’environnement,
clients navigateur/serveur, configuration locale, migrations initiales et
types générés, sans introduire encore les tables métier.

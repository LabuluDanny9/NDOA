# Étape 7 — Module invités

Date : 28 juillet 2026  
Branche : `codex/07-guest-module`

## Résultat

Le tableau invités conserve la recherche, le tri, les filtres et le CRUD
existant tout en utilisant l’API multi-tenant quand Supabase est disponible.
En mode démonstration sans configuration Supabase, la liste est persistée par
mariage dans `localStorage` et démarre avec les données de démonstration.

Fonctionnalités livrées :

- création, modification, suppression et duplication via `guests` API ;
- conversion explicite des statuts UI (`present`/`absent`) vers les statuts SQL
  (`accepted`/`declined`) ;
- import CSV, XLSX et XLS borné à 2 MiB / 1 000 lignes ;
- export CSV sécurisé, export XLSX et export PDF lisible ;
- QR individuel affiché dans la fiche invité et téléchargeable en SVG ;
- pagination côté API et tri/filtres côté tableau pour l’expérience locale.

Les champs spécifiques du prototype (adresse complète, genre, témoins et
numéro de table) restent locaux jusqu’aux écrans Groupes/Tables spécialisés.
Ils ne sont jamais envoyés à Supabase comme colonnes non prévues.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Les tests unitaires couvrent les mappers et statuts RSVP ; Playwright couvre
le chargement local, l’ajout et la recherche d’un invité.

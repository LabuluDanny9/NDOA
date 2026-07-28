# Étape 6 — Module Wedding

Date : 28 juillet 2026  
Branche : `codex/06-wedding-module`

## Résultat

L’assistant de création n’est plus un formulaire isolé. Il sérialise ses
valeurs vers `POST/PATCH /api/weddings`, puis redirige vers une liste métier
qui permet :

- création en brouillon ;
- modification avec reconstruction des valeurs depuis `theme` et `settings` ;
- duplication en nouveau brouillon ;
- publication et retour au brouillon ;
- suppression confirmée ;
- conservation locale contrôlée quand Supabase est explicitement
  non configuré en mode démonstration.

## Frontière de persistance

`lib/weddings/client.ts` est l’adaptateur HTTP typé. Il ne contient aucune clé
privée et vérifie l’enveloppe `{ data, error }` de l’API. Le repli local de
`lib/weddings/local-store.ts` est borné au navigateur et à l’erreur
`SUPABASE_NOT_CONFIGURED`; une erreur métier Supabase n’est pas masquée.

Les fichiers image ne sont pas sérialisés dans `localStorage`. Ils restent
dans le flux de formulaire jusqu’à l’étape Galerie/Storage dédiée.

## Pages

| Route | Fonction |
|---|---|
| `/dashboard/create-wedding` | assistant de création sept étapes |
| `/dashboard/weddings` | liste et actions de cycle de vie |
| `/dashboard/weddings/:weddingId` | édition API ou locale |

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Les tests unitaires vérifient les mappers et payloads. Le scénario Playwright
injecte un mariage local de démonstration puis couvre publication et
duplication.

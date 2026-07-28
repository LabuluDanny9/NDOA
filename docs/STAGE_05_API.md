# Étape 5 — API REST métier

Date : 28 juillet 2026  
Branche : `codex/05-api`

## Résultat

Les premiers endpoints REST sont implémentés dans l’App Router Next.js. Tous
les handlers passent par `requireApiContext`, donc aucune requête métier ne
fonctionne sans session Supabase valide et configuration explicite.

| Ressource | Collection | Élément |
|---|---|---|
| Mariages | `GET/POST /api/weddings` | `GET/PATCH/DELETE /api/weddings/:weddingId` |
| Événements | `GET/POST /api/weddings/:weddingId/events` | `GET/PATCH/DELETE .../:eventId` |
| Programme | `GET/POST /api/weddings/:weddingId/programs` | `GET/PATCH/DELETE .../:programId` |
| Invités | `GET/POST /api/weddings/:weddingId/guests` | `GET/PATCH/DELETE .../:guestId` |
| Groupes | `GET/POST /api/weddings/:weddingId/guest-groups` | `GET/PATCH/DELETE .../:groupId` |
| Tables | `GET/POST /api/weddings/:weddingId/guest-tables` | `GET/PATCH/DELETE .../:tableId` |

## Contrat HTTP

Une réponse réussie suit la forme `{ data, requestId }`. Les collections
ajoutent `{ items, pagination }`, avec `page`, `pageSize`, `total` et
`totalPages`. Une erreur suit `{ error: { code, message, details? }, requestId }`
et renvoie un code HTTP explicite : `400`, `401`, `403`, `404`, `409`, `429`,
`502` ou `503`.

Les paramètres `page`, `pageSize`, `sort`, `direction` et `search` sont bornés
et validés. Les recherches PostgREST échappent les caractères de motif avant
de construire le filtre `ilike`.

## Validation et tenant

Les payloads camelCase sont validés par Zod puis sérialisés en snake_case
vers le contrat `types/database.types.ts`. Les IDs de chemin sont des UUID.
Le `wedding_id` est toujours imposé par le chemin et les policies RLS
Supabase restent l’autorité finale pour l’appartenance et les rôles.

Les réponses n’utilisent jamais de clé service. En environnement sans
Supabase, l’API échoue volontairement avec `503 SUPABASE_NOT_CONFIGURED`, ce
qui est couvert par Playwright.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Les routes publiques d’invitation, RSVP et médias seront ajoutées dans les
étapes spécialisées suivantes avec des projections et limites dédiées ; elles
ne réutiliseront pas directement les tables privées des invités.

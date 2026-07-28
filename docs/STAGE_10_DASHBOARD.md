# Étape 10 — Dashboard et KPI

Date : 28 juillet 2026  
Branche : `codex/10-dashboard`

## Résultat

Le dashboard n’utilise plus de compteurs métier figés. L’endpoint
`GET /api/weddings/:weddingId/dashboard` agrège les statuts RSVP, les
événements à venir, l’activité et les notifications sous les mêmes policies
RLS que les routes métier.

La page `/dashboard` affiche :

- nombre de mariages et d’invités ;
- confirmés et réponses en attente ;
- histogramme et graphique circulaire Recharts ;
- prochains événements ;
- notifications non lues ;
- activités récentes et actions rapides.

Sans Supabase, `lib/dashboard/client.ts` calcule les mêmes KPI à partir du
stockage local invités/mariages afin de conserver une démo cohérente.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Le scénario Playwright vérifie le rendu du titre, des graphiques et de la
liste d’activité en mode démonstration.

# Étape 12 — Notifications et invitations

## Livré

- contrats REST tenant pour la file `messages` (`GET/POST /api/weddings/:weddingId/messages`) ;
- validation des canaux email, SMS, WhatsApp et notification interne, avec templates invitation, rappel RSVP et confirmation ;
- page `/dashboard/invitations` avec composition, sélection de canal, historique et statut `queued` explicite ;
- lecture des notifications internes et marquage lu via `/api/weddings/:weddingId/notifications` ;
- mode démonstration local persistant dans `localStorage` quand Supabase n'est pas configuré ;
- tests unitaires des templates et scénario E2E de mise en file.

## Limite volontaire

Cette étape prépare et trace les envois, mais ne prétend pas délivrer un email, SMS ou WhatsApp. Aucun secret de fournisseur n'est requis : tant qu'un adaptateur externe n'est pas configuré, les messages restent `queued` et sont visibles dans l'historique.

## Vérifications

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build` et `npm run test:e2e` doivent passer avant la fusion.

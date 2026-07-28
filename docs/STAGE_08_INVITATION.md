# Étape 8 — Invitation publique

Date : 28 juillet 2026  
Branche : `codex/08-invitation`

## Résultat

Les invitations publiques sont maintenant résolues par slug. La migration
`20260728090000_public_invitation_projection.sql` expose une seule fonction
`public.get_public_invitation(text)` : elle ne renvoie que les informations
publiables d’un mariage publié (couple, lieu, événements/programme, photos
publiques et cadeaux). Les tables invités, RSVP, messages, notifications et
journal restent invisibles au rôle `anon`.

La page `/invitation/[slug]` utilise la projection quand Supabase est configuré
et conserve l’invitation de démonstration lorsque l’environnement est vide.
Elle conserve les surfaces existantes :

- slug et métadonnées SEO ;
- compte à rebours ;
- lieu et lien Google Maps ;
- programme et histoire ;
- galerie, musique, partage et QR ;
- formulaire RSVP et cadeaux.

L’endpoint `GET /api/public/invitations/:slug` reprend le même contrat d’erreur
et échoue fermement avec `503 SUPABASE_NOT_CONFIGURED` sans configuration.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run supabase:validate
npm run build
npm run test:e2e
```

La validation PostgreSQL WASM rejoue les sept migrations et le test E2E vérifie
le slug résolu, le QR et la fermeture de l’endpoint public sans Supabase.

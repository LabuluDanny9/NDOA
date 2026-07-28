# Étape 9 — RSVP public

Date : 28 juillet 2026  
Branche : `codex/09-rsvp`

## Résultat

Le RSVP public est une mutation SQL contrôlée, idempotente et limitée à une
invitation publiée. Le RPC `public.submit_public_rsvp` :

- valide nom, e-mail, réponse, accompagnants et commentaire ;
- retrouve un invité préchargé dans le même mariage par e-mail et nom ;
- rejoue les contraintes d’accompagnants du trigger RSVP ;
- insère ou met à jour la réponse par `guest_id` sans exposer de coordonnées ;
- renvoie uniquement l’identifiant de réponse, son statut et sa date.

`POST /api/public/invitations/:slug/rsvp` valide l’enveloppe JSON et applique
les erreurs HTTP stables. Le formulaire invitation couvre Présent, Absent et
Peut-être, le nombre d’accompagnants, le commentaire, l’état d’envoi et la
confirmation. En mode démo sans Supabase, la confirmation est conservée
localement sous une clé par invitation et e-mail.

## Sécurité et idempotence

Le rôle `anon` ne reçoit aucun accès direct aux tables `guests` ou `rsvps`.
Seul le RPC est exécutable publiquement ; son `search_path` est vide et il
retourne une projection minimale. Une nouvelle réponse du même invité met à
jour la ligne existante au lieu de la dupliquer.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run supabase:validate
npm run build
npm run test:e2e
```

La suite contient 101 tests unitaires et le scénario E2E envoie une réponse
complète sur l’invitation de démonstration.

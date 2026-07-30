# Étape 13 — Administration et permissions

## Livré

- garde serveur `requireAdminApiContext` basée sur le claim JWT signé `user_role=admin` ;
- routes `/api/admin/users`, `/api/admin/users/:userId`, `/api/admin/activity` et `/api/admin/config` ;
- policies et grants SQL dédiés pour modifier uniquement les statuts et rôles depuis un compte admin ;
- protection contre l’auto-rétrogradation ou l’auto-désactivation du compte courant ;
- espace `/admin` avec liste des comptes, rôle, statut, dernière connexion, journal d’activité et état des fournisseurs ;
- repli démonstration local sans données sensibles quand Supabase n’est pas configuré.

## Sécurité

L’interface n’est pas la frontière de sécurité : chaque route admin revalide l’authentification et le claim admin côté serveur. Les clés et les configurations privées ne sont jamais renvoyées par l’endpoint de configuration.

## Vérifications

La migration d’administration est validée par PGlite, les tests de rôle et le scénario Playwright admin complètent les gates habituelles.

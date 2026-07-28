# Étape 3 — Authentification et rôles

Date : 28 juillet 2026  
Branche : `codex/03-authentication`

## Résultat

NDOA possède désormais les flux d’identité complets :

- connexion par adresse e-mail et mot de passe ;
- inscription avec nom, confirmation du mot de passe et acceptation des
  conditions ;
- confirmation d’e-mail par code PKCE ou `token_hash` ;
- demande de réinitialisation sans révéler l’existence d’un compte ;
- validation d’une session de récupération et changement du mot de passe ;
- déconnexion locale explicite par requête POST/Server Action ;
- protection des espaces organisateur, administrateur et invité ;
- identité réelle affichée dans le dashboard lorsqu’une session existe.

Les formulaires utilisent React Hook Form côté client et les mêmes schémas Zod
que les Server Actions. La validation serveur reste l’autorité.

## Routes

| Route | Accès | Rôle |
|---|---|---|
| `/login` | Public | — |
| `/register` | Public | — |
| `/forgot-password` | Public | — |
| `/reset-password` | Session de récupération | Authentifié |
| `/auth/callback` | Public, usage ponctuel | — |
| `/auth/confirm` | Public, token ponctuel | — |
| `/dashboard/**` | Protégé | `admin`, `organizer` |
| `/admin/**` | Protégé | `admin` |
| `/guest/**` | Protégé | `guest` |

Le proxy appelle `auth.getClaims()` avant toute décision. Les cookies
rafraîchis et les en-têtes anti-cache sont conservés même lors d’une
redirection.

## Contrat de rôles

La source d’autorité est le claim JWT signé `user_role`. Les valeurs acceptées
sont :

```text
admin | organizer | guest
```

Un compte confirmé sans claim personnalisé devient `organizer`. Cette valeur
permet le premier accès, mais ne confère aucun accès transversal aux données :
l’isolation par mariage sera imposée par les politiques RLS de l’étape 4.

Le rôle `admin` ne peut pas provenir de `user_metadata`, modifiable par
l’utilisateur. L’étape 4 ajoutera un Custom Access Token Hook adossé aux rôles
stockés en base. Un changement de rôle prendra effet au renouvellement du JWT.

## Configuration Supabase

Dans le tableau de bord Supabase :

1. activer le fournisseur **Email** ;
2. ajouter les URL locales, Preview et Production aux Redirect URLs ;
3. utiliser `/auth/callback` pour le flux PKCE standard ;
4. pour un template SSR à `token_hash`, pointer vers
   `/auth/confirm?token_hash={{ .TokenHash }}&type=...` ;
5. conserver une longueur minimale de 8 caractères ;
6. configurer un SMTP de production avant toute ouverture publique.

Le mode sans backend est strictement local. Avec `NODE_ENV=production`, une
configuration Supabase absente ferme les routes protégées et renvoie vers la
connexion.

## Sécurité

- aucune clé secrète n’est utilisée ;
- les erreurs de connexion ne révèlent pas de détail technique ;
- le flux « mot de passe oublié » renvoie une réponse identique, compte
  existant ou non ;
- les chemins de retour sont limités aux chemins internes ;
- aucune mutation de session n’est exécutée par une requête GET de
  déconnexion ;
- les rôles ne sont jamais accordés depuis les données contrôlées par
  l’utilisateur ;
- les limites d’envoi Supabase sont traduites en message stable.

## Références

- [Supabase — Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Supabase — SSR clients and getClaims](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase — Custom Claims and RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)
- [Supabase — Next.js user management](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## Barrières de sortie

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
git diff --check
```

Les tests couvrent les schémas, les rôles, les redirections ouvertes, la
configuration fail-closed et les cinq parcours Chromium.

## Limite externe

La machine ne dispose toujours ni de Docker/Podman ni d’identifiants Supabase
hébergés. Les appels réels d’envoi d’e-mail et de renouvellement de session ne
peuvent donc pas être testés localement. Leur code suit les API officielles et
les états non configurés sont testés sans simuler une réussite.

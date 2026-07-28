# Étape 11 — Galerie média

## Livré

- route tenant `GET/POST /api/weddings/:weddingId/photos` avec contrôle MIME, limite de 15 MiB, upload dans le bucket privé `wedding-media` et URL signée courte durée ;
- route `PATCH/DELETE /api/weddings/:weddingId/photos/:photoId` avec suppression coordonnée du fichier Storage ;
- compression navigateur (dimension maximale 2400 px, WebP qualité 0,84) avant transfert ;
- page `/dashboard/gallery` responsive avec grille, aperçu plein écran, réordonnancement et suppression ;
- mode démonstration local lorsque Supabase n'est pas configuré ;
- tests unitaires du contrat client et scénario Playwright de l'état vide.

## Décisions de sécurité

Les photos ne sont jamais rendues publiques : le bucket reste privé et chaque lecture passe par une URL signée d'une heure. Les noms de fichiers sont générés côté serveur avec un UUID, tandis que le nom original est conservé uniquement comme métadonnée. Les erreurs de validation sont renvoyées en `400` avant tout upload.

## Vérifications

`npm run check` et `npm run test:e2e` doivent passer avant de fusionner cette étape.

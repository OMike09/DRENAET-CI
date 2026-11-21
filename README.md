# DRENAET CI — étapes 1–3

Application web institutionnelle distincte de l'ancien essai APK. Étapes 1–2 : identité, affectations, instructions, missions et alertes internes. **Étape 3 : messagerie privée et rapports textuels à circuits configurables.** Les élèves et parents ne participent pas à la v1.

**Statut : étape 3 testée sur PostgreSQL local et Chromium (bureau + largeur mobile simulée), non déployée sur Render.** Lors du contrôle public précédent, l'application des étapes 1–2 et `/healthz` répondaient sur le service Render, mais nous n'avons pas accès à sa base, à ses sessions privées ou à ses sauvegardes. Aucun test de l'étape 3 n'a été effectué sur Render ou sur téléphone physique. Voir [ETAPE_3_MESSAGERIE_RAPPORTS.md](ETAPE_3_MESSAGERIE_RAPPORTS.md).

## Fonctionnement

- Comptes activés individuellement avec code provisoire à usage unique ; sessions HTTP-only, CSRF, mot de passe personnel de 12–128 caractères, rôles et rattachements contrôlés côté serveur. L'administrateur général est distinct des directeurs régionaux.
- Directions, établissements et services multiples avec séparation serveur des périmètres. Comptes suspendus bloqués ; audit des opérations sensibles conservé.
- Instructions et missions hiérarchiques avec échéances, priorités, états, réponses et validations tracées ; alertes **internes** ciblées, non assimilées au push système.
- Messages privés 1 à 1 entre personnes actives reliées directement dans la hiérarchie ou affectées à la même unité. Lecture des conversations réservée aux participants ; le simple affichage de la liste ne marque pas les messages ouverts.
- Modèles de rapports centraux ou propres à une direction ; étapes ordonnées chef d'établissement → directeur régional → administration générale, selon la ligne hiérarchique effective de l'auteur. L'auteur soumet, reçoit d'éventuelles demandes de correction, resoumet sans effacer l'ancienne version ; seuls les validateurs désignés approuvent leur étape.
- PostgreSQL obligatoire, schéma isolé `drenaet_ci` et migrations transactionnelles additives 001, 002 et 003. Les anciennes données dans d'autres schémas ne sont pas importées ni supprimées.

**Non livrés :** pièces jointes, stockage de fichiers privés, messagerie de groupe, choix libre de validateurs nominatifs, push système, bibliothèque, calendrier, statistiques métiers. Aucun texte ou média utilisateur n'est traduit automatiquement. Les circuits avec plusieurs titulaires du même rôle ne sont pas résolus arbitrairement : le dépôt est refusé tant que la configuration des comptes n'est pas univoque.

## Déploiement du delta 3

L'archive de l'étape 3 contient **seulement les fichiers ajoutés ou modifiés depuis le colis 2**. Extraire et reporter ces fichiers au même chemin dans le dépôt existant ; **ne pas téléverser le ZIP comme fichier applicatif**, ni remplacer le dépôt par cette archive seule. Node.js >=20 ; `npm install`, `npm start`.

`DATABASE_URL` demeure configurée **en privé** dans Render et doit utiliser une connexion PostgreSQL **directe, non poolée** (pas de suffixe Neon `-pooler`) ; le programme utilise un `search_path` de session et exécute les migrations au démarrage. Ne divulguez pas la valeur, ne l'inscrivez pas dans GitHub ni dans ce ZIP. `BOOTSTRAP_LOGIN` et `BOOTSTRAP_PASSWORD` servent uniquement à la création initiale si aucun compte n'existe ; une fois le compte administrateur actif et sa reconnexion vérifiée, la variable secrète de bootstrap peut être retirée lors d'un déploiement planifié sans réinitialiser le compte. `PORT` est fourni par Render. **Ne pas activer `DRENAET_ALLOW_PREVIEW=1` en production.**

Avant le prochain déploiement : confirmer l'inventaire de la base, sa sauvegarde et la restauration, puis la version actuelle du dépôt. La migration 003 est appliquée **automatiquement au premier démarrage** du code ; elle crée de nouvelles tables et ne supprime ni les comptes ni les instructions/missions existantes. Une migration 002→003 avec données préexistantes a été testée sur une base locale, mais **pas sur Neon**. Après déploiement : vérifier logs, `/healthz`, connexion/reconnexion, isolation de deux directions, envoi/réception d'un message et soumission/validation d'un rapport avec des comptes de test autorisés.

Tests locaux, sur une URL de **test uniquement** dont le rôle peut créer et supprimer des bases temporaires :

```text
npm test
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://<base-locale-de-test> npm test
```

`npm test` sans URL locale ignore les tests PostgreSQL/Chromium ; Chromium nécessite `npx playwright install --with-deps chromium`. Ne jamais exécuter `TEST_DATABASE_URL` contre la base de production. Se reporter aussi aux documents des étapes 1 et 2 pour l'architecture antérieure.

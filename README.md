# DRENAET CI — étapes 1–4

Application web institutionnelle séparée de l'ancien essai APK. Étapes 1–3 : comptes et hiérarchie, instructions, missions, messagerie privée et rapports à circuits configurables. **Étape 4 : bibliothèque documentaire privée et calendrier cloisonné**. Pas de comptes élèves ou parents en v1.

**Statut : étape 4 testée localement sur PostgreSQL et Chromium (ordinateur et largeur mobile simulée), mais non déployée par l'agent sur Render.** L'application des étapes 1–3 et `/healthz` ont répondu publiquement lors du contrôle ; nous n'avons pas accès aux comptes privés, à la base Neon, aux sauvegardes ni aux journaux du déploiement de cette étape. Voir [ETAPE_4_BIBLIOTHEQUE_CALENDRIER.md](ETAPE_4_BIBLIOTHEQUE_CALENDRIER.md).

## Fonctions disponibles dans les sources

- Sessions HTTP-only, CSRF, comptes nominatifs activés par code à usage unique, rôles et affectations contrôlés côté serveur ; suspension et audit. Administrateur général distinct des directeurs régionaux ; aucune inscription publique.
- Instructions et missions hiérarchiques, échéances et décisions tracées ; alertes **internes** ciblées.
- Messagerie privée 1 à 1 distincte des instructions, avec lecture réservée aux participants et statut d'ouverture enregistré après affichage réel. Rapports textuels à circuits ordonnés configurés par l'administration centrale et les directions régionales ; versions et décisions conservées.
- Bibliothèque : PDF, PNG ou JPEG de **2 Mio au plus**, déposés dans PostgreSQL et servis uniquement après authentification et contrôle de visibilité. Documents privés à l'auteur ; publication à l'établissement par chef/adjoint, à la région par directeur régional ou générale par administrateur. Téléchargement forcé, archivage non destructif et audit.
- Calendrier : événements privés, établissement, région ou généraux avec les mêmes pouvoirs de publication ; affichage par mois, modifications versionnées, annulation non destructrice, contrôle de conflit et historique consultable par les personnels autorisés.
- Schéma isolé `drenaet_ci`, migrations transactionnelles additives 001 à 004 ; autres schémas et sources non importés ni supprimés.

**Limites explicites :** pas de pièces jointes aux messages/rapports, pas de formats Office dans la bibliothèque de ce lot, pas d'antivirus ni de prévisualisation intégrée des PDF, pas de rappels automatiques, invitations d'agenda, push système ou synchronisation externe. Statistiques métiers à développer. Les dates du calendrier sont saisies dans le fuseau horaire du navigateur puis stockées en `timestamptz` PostgreSQL. Surveiller la capacité de stockage de PostgreSQL avant de généraliser l'usage des fichiers.

## Installer le delta 4 sur l'application déjà en place

L'archive de l'étape 4 contient **seulement les fichiers modifiés ou ajoutés par rapport au colis 3**. Décompresser et reporter ces fichiers aux mêmes chemins dans le dépôt existant : **ne pas téléverser le ZIP tel quel** ni remplacer le projet entier. Node.js >=20, `npm install`, `npm start`.

`DATABASE_URL` est configurée **en privé** dans Render et doit être une URL PostgreSQL **directe, non poolée**, sans hôte Neon `-pooler` : les migrations au démarrage et le `search_path` exigent la session directe. Ne communiquez pas cette valeur ; n'inscrivez aucun secret dans GitHub ou dans le colis. `BOOTSTRAP_LOGIN` et `BOOTSTRAP_PASSWORD` ne servent qu'à l'initialisation si aucun compte n'existe ; ils ne réinitialisent jamais un administrateur déjà créé. `PORT` est fourni par Render. **Ne pas activer `DRENAET_ALLOW_PREVIEW=1` en production.**

La migration 004 s'exécute **automatiquement au premier démarrage** du code. Avant un déploiement, vérifier la version actuelle, la base cible, son inventaire et une sauvegarde/restauration vérifiée. Un essai local de migration **003→004 avec messages et rapports préexistants** a réussi ; cela **ne prouve pas** le résultat sur Neon. Après mise en ligne : vérifier les logs et `/healthz`, la reconnexion, les périmètres de deux directions, un dépôt/téléchargement PDF privé et un événement créé/modifié/annulé avec des comptes de test autorisés. Ne pas envoyer de fichiers sensibles réels tant que ces contrôles n'ont pas été réalisés.

Tests sur une base PostgreSQL **locale éphémère**, jamais sur la production :

```text
npm test
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://<base-locale-de-test> npm test
```

La suite sans URL de test ignore les tests PostgreSQL/Chromium. Chromium nécessite `npx playwright install --with-deps chromium`. Se reporter aux documents des étapes 1–3 pour les fonctionnalités et limites antérieures.

# DRENAET CI — étape 1 (projet web séparé)

**Statut : prototype fonctionnel testé localement sur PostgreSQL réel, non déployé sur le Render existant.** Les instructions, tâches, messagerie, rapports, bibliothèque, calendrier, statistiques métiers et notifications ne sont pas encore livrés. Aucun écran ne prétend le contraire. Ne pas remplacer l'APK EDUC CI ni supprimer ses données.

## Contenu réellement opérationnel

- Entrée web responsive sans comptes élève/parent et sans faux comptes de démonstration.
- Création initiale unique d'un administrateur général à partir d'identifiants **privés** de démarrage ; jamais réinitialisé à chaque redémarrage.
- Sessions HTTP-only, 12 heures, CSRF, restrictions d'origine, mots de passe dérivés par scrypt salé, protection contre les essais répétés ; cookies `Secure` lorsque la requête arrive par HTTPS (proxy Render pris en compte).
- Première connexion avec code provisoire aléatoire à usage unique, expiration à 7 jours, puis choix d'un secret personnel de 12 à 128 caractères. Réinitialisation par un supérieur habilité, invalidation des sessions.
- Directions régionales multiples, établissements et services ; affectations et listes filtrées serveur par direction/établissement. Journal des opérations d'administration append-only (déclencheur SQL).
- Administrateur général : directions, unités, collaborateurs non généraux, labels de fonctions et journal global. Directeur régional : unités et collaborateurs de sa région, journal de sa région. Chef d'établissement : subordonnés de son établissement. Autres rôles : profil et tableau de bord en lecture de leur seul périmètre.
- Noms des fonctions ajustables par administrateur général ; clés de rôle et plafonds d'attribution protégés côté serveur. Les chemins complets des instructions et autres délégations hiérarchiques sont prévus **dans les étapes ultérieures**, pas présentés comme livrés ici.
- Migrations versionnées et non destructives dans le schéma PostgreSQL isolé `drenaet_ci`, même si une base existante contient d'autres tables dans `public`.

## Installer sur un service Node.js distinct, après sauvegarde de l'existant

Node.js >=20. Ne configurez **pas** les mots de passe ou URL de base dans les fichiers, le dépôt, un ZIP public ou une capture d'écran.

```text
npm install
npm start
```

Variables **à définir dans l'interface privée du service Render**, sans changer arbitrairement les variables déjà présentes :

- `DATABASE_URL` : URL de la base PostgreSQL dédiée, à confirmer par l'administrateur. Utiliser un compte SQL avec permissions limitées à ce projet. Si le service exige TLS, configurer PostgreSQL et ses certificats conformément aux paramètres du fournisseur ; ne pas désactiver la vérification TLS par défaut.
- `BOOTSTRAP_LOGIN` : identifiant de l'administrateur général à créer **uniquement si la table des comptes DRENAET CI est vide**.
- `BOOTSTRAP_PASSWORD` : secret initial robuste de cet administrateur, strictement privé ; une fois le premier compte créé, la variable ne le réinitialise plus. Retirer la variable de démarrage après la création et déplacer le secret dans le gestionnaire de mots de passe institutionnel.
- `PORT` : défini automatiquement par Render.
- `DRENAET_ALLOW_PREVIEW=1` : réservé exclusivement à un aperçu local intégré ; **ne jamais l'activer en production** (désactive la protection anti-intégration dans une iframe pour cet aperçu).

**IMPORTANT :** l'absence de `DATABASE_URL` ou du secret initial au premier démarrage fait échouer le service de façon explicite ; il n'y a ni base locale silencieuse ni comptes publics de démonstration. La sauvegarde réelle et la connexion à la base Render ne peuvent pas être vérifiées depuis cet environnement sans accès autorisé. Ne pas redéployer le service qui héberge actuellement l'APK avant d'avoir identifié son dépôt, sauvegardé son éventuel stockage et décidé du remplacement.

### Vérifications locales

```text
npm test
TEST_DATABASE_URL=postgres://... npm test
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://... npm test
```

La suite sans URL locale exécute les tests unitaires et ignore intentionnellement l'intégration PostgreSQL et Chromium. La suite avec URL de **test seulement**, dont l'utilisateur SQL peut créer/supprimer ses bases, crée des bases temporaires, teste API et navigateur et les détruit ensuite. Ne jamais définir `TEST_DATABASE_URL` sur la base de production. Chromium nécessite `npx playwright install chromium` et ses dépendances système. Le test vérifie l'activation, l'isolation de deux directions, les interdictions d'escalade, les sessions invalidées, l'audit et les données conservées après redémarrage.

## Séquence prudente pour l'intégration

1. Identifier le **nouveau dépôt** relié au Web Service visé ; examiner sa configuration et les variables **par nom seulement**. Ne pas téléverser ce dossier sur l'ancien service EDUC CI par erreur.
2. Faire sauvegarder la vraie base PostgreSQL avec un plan de restauration testé sur une base distincte ; ne jamais effacer un schéma existant.
3. Déployer ce projet web sur un service Node.js distinct ou après décision explicite de bascule, puis vérifier `/healthz`, `/api/auth/session`, login initial, création de 2 directions, isolation et reconnexion après redémarrage Render.
4. Inventorier les données éventuellement conservées dans des appareils utilisant l'APK antérieur. Leur export/import (et le traitement des données relatives aux élèves) nécessitent un accord, un schéma et un test de migration séparés. Aucun import ni effacement n'est effectué dans l'étape 1.

Voir [ETAPE_1_DIAGNOSTIC_ET_ARCHITECTURE.md](ETAPE_1_DIAGNOSTIC_ET_ARCHITECTURE.md) pour le diagnostic, les décisions de hiérarchie et les étapes suivantes.

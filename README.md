# DRENAET CI — étapes 1–2 (projet web séparé)

**Statut : application testée localement sur PostgreSQL et Chromium, non déployée sur le Render existant.** Instructions, missions et alertes *internes* de l'étape 2 sont disponibles ; messagerie, rapports autonomes, bibliothèque, calendrier, statistiques métiers et push système restent à construire. Ne pas remplacer l'APK EDUC CI ni supprimer ses données. Voir [ETAPE_2_INSTRUCTIONS_MISSIONS.md](ETAPE_2_INSTRUCTIONS_MISSIONS.md) pour le périmètre et les limites.

## Contenu réellement opérationnel

- Entrée web responsive sans comptes élève/parent et sans faux comptes de démonstration.
- Création initiale unique d'un administrateur général à partir d'identifiants **privés** de démarrage ; jamais réinitialisé à chaque redémarrage.
- Sessions HTTP-only, 12 heures, CSRF, restrictions d'origine, mots de passe dérivés par scrypt salé, protection contre les essais répétés ; cookies `Secure` lorsque la requête arrive par HTTPS (proxy Render pris en compte).
- Première connexion avec code provisoire aléatoire à usage unique, expiration à 7 jours, puis choix d'un secret personnel de 12 à 128 caractères. Réinitialisation par un supérieur habilité, invalidation des sessions.
- Directions régionales multiples, établissements et services ; affectations et listes filtrées serveur par direction/établissement. Journal des opérations d'administration append-only (déclencheur SQL).
- Administrateur général : directions, unités, collaborateurs non généraux, labels de fonctions et journal global. Directeur régional : unités et collaborateurs de sa région, journal de sa région. Chef d'établissement : subordonnés de son établissement. Autres rôles : profil et tableau de bord en lecture de leur seul périmètre.
- Noms des fonctions ajustables par administrateur général ; clés de rôle et plafonds d'attribution protégés côté serveur. Les instructions et missions de l'étape 2 sont tracées et limitées aux liens hiérarchiques directs autorisés. Les autres délégations et circuits métier restent pour de futures étapes.
- Migrations versionnées et non destructives dans le schéma PostgreSQL isolé `drenaet_ci`, même si une base existante contient d'autres tables dans `public`.

## Installer sur un service Node.js distinct, après sauvegarde de l'existant

Node.js >=20. Ne configurez **pas** les mots de passe ou URL de base dans les fichiers, le dépôt, un ZIP public ou une capture d'écran.

```text
npm install
npm start
```

Variables **à définir dans l'interface privée du service Render**, sans changer arbitrairement les variables déjà présentes :

- `DATABASE_URL` : URL privée de connexion PostgreSQL **directe, non poolée** ; ne pas divulguer la valeur déjà configurée sur Render. Le projet rejette `-pooler` avant de se connecter car ses migrations et `search_path` requièrent une session directe. Utiliser un compte SQL habilité pour le schéma dédié et conserver la vérification TLS. Faire tourner tout secret publié auparavant.
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

La suite sans URL locale exécute les tests unitaires et ignore intentionnellement l'intégration PostgreSQL et Chromium. La suite avec URL de **test seulement**, dont l'utilisateur SQL peut créer/supprimer ses bases, crée des bases temporaires, teste API et navigateur et les détruit ensuite. Ne jamais définir `TEST_DATABASE_URL` sur la base de production. Chromium nécessite `npx playwright install chromium` et ses dépendances système. Les tests couvrent aussi les instructions et missions, transitions, déduplication des alertes, immutabilité des événements, et les parcours navigateur desktop/mobile simulé. Ils ne vérifient pas Render ni des téléphones physiques.

## Séquence prudente pour l'intégration

1. Identifier le **nouveau dépôt** relié au Web Service visé ; examiner sa configuration et les variables **par nom seulement**. Ne pas téléverser ce dossier sur l'ancien service EDUC CI par erreur.
2. Faire sauvegarder la vraie base PostgreSQL avec un plan de restauration testé sur une base distincte ; ne jamais effacer un schéma existant.
3. Déployer ce projet web sur un service Node.js distinct ou après décision explicite de bascule, puis vérifier `/healthz`, `/api/auth/session`, login initial, création de 2 directions, isolation et reconnexion après redémarrage Render.
4. Inventorier les données éventuellement conservées dans des appareils utilisant l'APK antérieur. Leur export/import (et le traitement des données relatives aux élèves) nécessitent un accord, un schéma et un test de migration séparés. Aucun import ni effacement n'est effectué dans l'étape 1.

Voir [ETAPE_1_DIAGNOSTIC_ET_ARCHITECTURE.md](ETAPE_1_DIAGNOSTIC_ET_ARCHITECTURE.md) pour le diagnostic, les décisions de hiérarchie et les étapes suivantes.

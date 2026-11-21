# Colis 10 — Observatoire régional de l’éducation

## Statut et principe

Module additif à DRENAET CI, conçu pour la **même base PostgreSQL** et les fonctions déjà présentes. Ne remplace ni « Vue d’ensemble » ni « Statistiques » ni « Exports » des étapes antérieures. L'utilisateur a confirmé que son site avait redémarré après le correctif du colis 9 ; **ce colis 10 n'a pas été installé ni vérifié sur Render ou Neon par l'agent**. Les vérifications ci-dessous sont effectuées dans des bases PostgreSQL jetables et dans Chromium local. Aucun effectif scolaire ni statistique officielle n'a été chargé.

## Mise en place en production (par le responsable disposant des accès)

1. Vérifier que les fichiers des étapes 1–9 sont présents dans le dépôt déployé et que les migrations 001–009 de la base sont terminées. Comparer le commit réellement déployé et les migrations avant d'appliquer le delta. Ne pas remplacer le dépôt par le ZIP et **ne pas supprimer** de fichiers existants.
2. Faire une sauvegarde cohérente et éprouver la restauration sur une base séparée. Prévoir une fenêtre de maintenance et une marche arrière applicative et base de données. La migration 010 **crée des tables** et des déclencheurs ; le code précédent ne les utilise pas. Éviter un déploiement de code 10 sans migration 10. Ne jamais exécuter les tests automatiques sur Neon/production : ils créent et suppriment des bases temporaires.
3. Copier le contenu du ZIP **à la racine du dépôt, en conservant exactement les chemins** ; le ZIP est un delta. `npm ci` sur Node.js 20 ou supérieur ; une dépendance supplémentaire `csv-parse` est verrouillée. Préserver les variables d'environnement en dehors du dépôt. Utiliser une URL PostgreSQL **directe non poolée** pour la connexion et la migration. Dans le schéma `drenaet_ci`, le démarrage applique automatiquement `migrations/010_observatory.sql` et enregistre la version 10 dans `schema_migrations` (transactions dans `db.js`). Ne pas modifier à la main `schema_migrations`.
4. Déployer seulement après validation sur préproduction avec une copie **anonymisée** représentative, puis surveiller les logs, `/healthz`, l'authentification, la navigation historique, la nouvelle rubrique Observatoire et la table des migrations. Garder les sauvegardes hors du dépôt et des messageries. Si problème, revenir au code précédent et analyser la migration sans supprimer d'emblée les nouvelles données.

## Démarrage des données — zéro valeur inventée

- Les établissements existants (créés via « Structure ») sont comptés dans leur périmètre ; secteur, niveaux, ville et coordonnées sont **non renseignés** tant qu'une fiche n'est pas proposée et validée. Aucun effectif d'élèves, taux de réussite, résultat d'examen ou nombre de classes n'est estimé.
- La direction et les chefs proposent des versions de fiche ; seul le directeur régional valide/rejette avec motif de rejet. Une correction crée une nouvelle version ; la dernière **validée** seule est diffusée et cartographiée. Primaire et secondaire sont possibles dans la même fiche. Les enseignants/éducateurs ou leurs responsables proposent leurs disciplines/niveaux ; seule une version validée et rattachée à leur **établissement actuel** contribue aux répartitions.
- Import « Référence validée » : ouvrir **Observatoire → Importer**, utiliser le modèle CSV UTF-8 au séparateur `;`, avec les colonnes `code;sector;has_primary;has_secondary;city;commune;locality;latitude;longitude;administrative_info;source_reference`. `sector` vaut `public` ou `private`; les niveaux valent `oui`/`non`, `true`/`false`, ou `1`/`0`. Une source/référence est obligatoire. Limites 100 lignes / 40 Kio ; contrôle et empreinte SHA-256 à la prévisualisation. Les codes doivent déjà être des établissements actifs de **la même direction régionale**. La confirmation est transactionnelle, crée uniquement des **fiches en attente**, jamais de comptes ni d'établissements. La validation régionale reste nécessaire.
- Les déclarations de progression, difficultés, visites, formations, absences et besoins RH ont une période et une provenance. Les déclarations en attente/rejetées sont exclues des indicateurs. Pas d'automatisation d'une valeur « officielle » sans politique de collecte et revue humaine.

## Écrans, définitions et droits

- **Indicateurs** : établissements et comptes actifs au moment de la consultation, ventilation public/privé et primaire/secondaire seulement depuis les fiches validées, disciplines/niveaux du personnel actif aux profils validés ; activités validées dans la période ; dossiers de rapports et actions administratives déjà enregistrés. Un secteur non renseigné est affiché explicitement. Connexion = au moins un compte actif de l'établissement avec une session non expirée au moment de la requête, et non la disponibilité du réseau scolaire. Les mouvements sont les changements d'affectation journalisés dans l'application, pas des mutations RH externes.
- **Carte** : uniquement des points à coordonnées renseignées dans une version de fiche validée d'un établissement actif. Le contour ivoirien local provient de Natural Earth, diffusé via geoBoundaries (domaine public) : `web/civ-outline.geojson`. Aucun point n'est géocodé ou déduit du nom. Carte plafonnée à 1 000 points renvoyés ; préciser les filtres en cas de plafond. Filtres secteur, niveau, ville/commune, connexion et région (administrateur général).
- **Fiches et alertes** : fiches et personnel nominatif réservés aux responsables locaux ; le compte personnel ne voit que ses propres déclarations. Les alertes sont recalculées à la consultation : fiche absente/périmée selon un seuil régional explicite, échéance de rapport réellement créée et non liée, missions/instructions échues, besoins RH/difficultés validés récents. Aucune échéance fictive n'est générée. Une échéance est rapprochée manuellement d'un rapport transmis **du même établissement** par son identifiant. Les alertes ne sont pas des notifications push autonomes.
- **Rapports** : PDF et Excel (`.xlsx`) mensuels, trimestriels, annuels, par établissement, discipline, personnel ou pédagogie ; bornes de date contrôlées (maximum 366 jours). L'export est journalisé, plafonné à 200 lignes PDF / 1 000 Excel. Les totaux « établissements »/« comptes actifs » sont instantanés même avec un filtre de dates ; ne pas les présenter comme séries historiques. Les exports CSV/PDF/XLSX antérieurs demeurent accessibles dans « Exports ».
- **Accès** : administrateur général pour les agrégats globaux et régionaux, directeur régional pour sa direction, chef pour son établissement, enseignant/éducateur pour ses déclarations. Délégations **explicites de lecture** pour certains autres rôles locaux : la direction peut accorder lecture « personnel » ou « pédagogie » sur une région/école ; le chef peut déléguer la pédagogie dans son école aux fonctions habilitées. Le serveur vérifie à chaque requête le rôle, l'affectation et le périmètre ; les délégations ne permettent ni la validation, ni l'export, ni l'accès au dossier nominatif. La réaffectation invalide la délégation par comparaison avec rôle/unité au moment de l'octroi. Aucun accès interrégional aux fiches privées et déclarations.

## Vérification locale reproductible

Sur un PostgreSQL **local de test**, avec privilège de création/suppression des bases temporaires :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_DE_TEST' npm test
```

Résultat local après développement du colis 10 : **31 tests réussis / 31**, aucun ignoré, couvrant les migrations 001–010, droits multi-région, import, validation, immutabilité, exports et navigateur Chromium mobile/bureau, ainsi que les étapes précédentes. Cette réussite **ne prouve pas** le fonctionnement authentifié sur Render ou avec Neon. En production, tester manuellement avec des comptes autorisés sur les régions concernées, sans lancer cette suite de tests.

### Limites explicites

Pas de connexion au système officiel de statistiques scolaires ni d'import libre créant de nouvelles écoles ; pas de calcul de réussite d'élèves/absentéisme national ; pas de SIG complet, de fond de carte dynamique en réseau ou de géocodage. Les fiches et disciplines proviennent des déclarations locales vérifiées, pas d'une source ministérielle garantie. La carte utilise un contour national simplifié sans découpage officiel des directions régionales. Les quotas d'export et d'import sont bornés pour protéger le service.

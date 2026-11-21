# DRENAET CI — application et Observatoire régional (colis 10)

Application Node.js/PostgreSQL pour les directions régionales et établissements, conçue comme service distinct de l'ancien essai APK. **Le colis 10 est additif** : la navigation antérieure (Vue d'ensemble, Statistiques, Exports, etc.) reste présente. Pour les modalités d'installation, les droits, les définitions et les limites des indicateurs, consulter [le guide du colis 10](ETAPE_10_OBSERVATOIRE_REGIONAL.md).

## Modules conservés

- Comptes nominatifs, hiérarchie, sessions privées, protection CSRF et journal d'audit ; instructions, missions, alertes.
- Messagerie privée, rapports à circuits paramétrables, bibliothèque et agenda ; statistiques administratives existantes, notifications et push web facultatif.
- Pièces privées incluant notes vocales, quota de départ de 10 Mio par fichier réglable par l'administrateur général ; courriers entrants/sortants avec transmissions et accusés, groupes privés nominatifs.
- Rappels automatiques sans doublons et exports des listes/statistiques historiques en CSV, PDF et Excel (.xlsx).

## Colis 10 : Observatoire régional

- Fiches d'établissements publics/privés et de personnel, primaire et secondaire, déclarations pédagogiques/RH et import contrôlé de CSV sur des établissements **déjà créés** ; contenus en attente tant qu'ils ne sont pas validés par la direction régionale.
- Tableaux de bord régionaux, filtres, carte locale de la Côte d'Ivoire ne montrant que les établissements aux coordonnées validées, alertes déclenchées par règles/échéances réelles et rapports périodiques PDF/Excel.
- Permissions revérifiées côté serveur à chaque requête selon région/établissement/affectation, délégations explicites de lecture et consultation personnelle limitée.

**Important :** aucun chiffre officiel d'effectifs ou de résultats scolaires n'est inventé ou injecté. Une fiche non renseignée reste non renseignée. La base PostgreSQL et le schéma `drenaet_ci` existants reçoivent une migration additive `010_observatory.sql` ; la migration n'efface pas les données antérieures.

## Installation et tests

Node.js >= 20, PostgreSQL direct non poolé, variables d'environnement privées selon `.env.example` et les guides précédents. `npm ci` puis `npm start`. Le démarrage applique les migrations disponibles. Ne pas utiliser `DRENAET_ALLOW_PREVIEW=1` en production. Les tests créent des bases jetables : sur un PostgreSQL **local uniquement**, `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<URL PostgreSQL de test> npm test` après installation de Chromium Playwright. **31/31 tests locaux réussis** avec PostgreSQL et Chromium simulé. Le redémarrage de la version antérieure a été confirmé par l'utilisateur ; le colis 10 **n'a pas été déployé ni vérifié en production** par l'agent.

Les guides des colis 1–9 restent dans ce dépôt pour les détails des étapes précédentes. Avant un déploiement : sauvegarde/restauration vérifiée, comparaison du dépôt réellement lancé, puis application du delta selon [le guide du colis 10](ETAPE_10_OBSERVATOIRE_REGIONAL.md). Ne jamais utiliser la base Neon de production pour les tests de développement.

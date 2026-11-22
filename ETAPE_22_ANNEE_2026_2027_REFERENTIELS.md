# Colis 22 — Année 2026–2027 et référentiels configurables

## Installation sur l’application existante

**Delta à appliquer après le colis 21 ; ne remplacez pas le projet entier.** L’installation du colis 21 sur la cible n’a pas été confirmée ici. Sauvegarder code et base PostgreSQL, tester la restauration sur une copie, vérifier les SHA-256 du manifeste, copier les fichiers du ZIP à la racine du projet sans supprimer les autres, puis `npm ci` sous Node ≥ 20. Vérifier la connexion PostgreSQL **directe, non poolée** ; redémarrer en préproduction et contrôler `/healthz`, 22 migrations dans `schema_migrations`, les accès réels et les données historiques avant installation en production. Le démarrage applique `022_academic_defaults.sql` puis exécute l’initialisation additive transactionnelle ; répéter le démarrage n’ajoute pas de doublons et ne remplace pas les saisies locales. Une restauration du code seulement après des écritures de version 22 n’est pas un retour arrière sûr. **Aucun déploiement ni contrôle de production n’a été effectué.**

## Année et provenance des dates

- Année 2026–2027 et ses déclinaisons de région/établissement sur les unités réellement présentes, avec trois trimestres et premier trimestre utilisable lorsque l’année est active. Une année active préexistante n’est pas remplacée ; la nouvelle année peut rester planifiée selon le périmètre. Les actions de dates, états, archivage et historique existantes restent applicables.
- La rentrée **14 septembre 2026** est mentionnée par [le ministère](https://www.education.gouv.ci/index.php/Activite/details/596). Les bornes **14/09–04/12/2026**, **07/12/2026–12/03/2027**, **15/03–11/06/2027** et la fin d’année **30/07/2027** sont **relayées par la presse, à confirmer**, et non présentées comme validées officiellement : [Abidjan.net](https://news.abidjan.net/articles/749205/rentree-scolaire-2026-2027-en-cote-divoire-pres-de-neuf-millions-deleves-reprennent-le-chemin-de-lecole), [Afriksoir](https://afriksoir.net/rentree-scolaire-2026-2027-en-cote-divoire-voici-les-dates-cles-a-retenir/), [Ouestin](https://ouestin.com/education/2026/09/08/le-calendrier-scolaire-2026-2027-en-cote-d-ivoire-devoile/). La provenance, le statut non certifié et la correction motivée sont visibles. Les échéances d’ouverture/clôture des évaluations, composition, saisie/validation des notes et fermeture finale **restent vides** tant qu’elles ne sont pas publiées ou saisies par l’autorité habilitée.

## Catalogue unique et paramètres locaux

- Catalogue commun unique de matières de départ (extensible et non réputé officiel/exhaustif), niveaux préscolaire/primaire, collège 6e–3e, lycée Seconde–Terminale, technique et professionnel ; 11 types d’évaluations configurables. Aucune matière n’est automatiquement affectée à toutes les classes. L’administrateur général entretient les référentiels ; le chef d’établissement associe les matières à ses classes, niveaux/séries/filières, règle coefficients/volumes et configure ses horaires, sans modifier les matières communes.
- Les horaires indicatifs **55 minutes, 07h30, 14h00** sont des indications dans les réglages ; aucun emploi du temps, jour de repos ou effectif réel n’est généré. Les profils scolaires, séries, filières, effectifs et informations d’établissement sont renseignés localement par personnes habilitées. Les fonctions professionnelles ne créent pas de comptes personnels. Les types d’établissement `public`, `private`, `other` et les champs d’établissement sont facultatifs et concernent seulement les vrais établissements.
- Treize familles de références administratives modifiables : courriers, annonces, priorités, rapports, états des demandes, formations, missions, réunions, absences, retards, états de pointage, confidentialités et documents. Les **codes techniques des états, priorités et confidentialités restent fixes** : un libellé ou une sous-catégorie ne change ni permission, ni transition, ni calcul. Les classifications métier facultatives sont sélectionnables à la création des dossiers existants (missions, rapports, formations, courriers, annonces, réunions du calendrier, justifications de retard et indisponibilités) et consultables dans leurs détails, sans rendre invalides les anciens dossiers non classés. Les changements d’une classification sur un brouillon d’annonce sont conservés en historique ; les autorisations d’accès au dossier sont vérifiées avant de renvoyer son classement. Il n’y a pas de nouvelle activité fictive.

## Dix vérifications locales avant livraison

Tests sur PostgreSQL jetable et Chromium, **jamais sur Neon** :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

Résultat de la suite complète après les modifications : **53/53 réussis**. Les dix points demandés ont été contrôlés :

1. Année 2026–2027 visible dans l’espace académique et le catalogue des emplois du temps (`defaults22-postgres.test.js`, Chromium).
2. Trois trimestres rattachés, premier ouvert, provenance et échéances facultatives (`defaults22-postgres.test.js`).
3. Matières proposées dans le formulaire d’affectation (`defaults22-postgres.test.js`, Chromium) ; catalogue commun modifiable uniquement par l’administrateur.
4. Création d’une classe propre à un établissement et à son année (`defaults22-postgres.test.js`).
5. Association locale classe/niveau/matière, coefficients et volume (`defaults22-postgres.test.js`).
6. Affectation d’un véritable enseignant à une matière et à sa classe (`defaults22-postgres.test.js`).
7. Emplois du temps : année visible, réglages, besoins et tests de conflits/validation (`defaults22-postgres.test.js`, `timetables-postgres.test.js`).
8. Cahier de textes : leçon créée par l’enseignant sur l’affectation et conservée (`defaults22-postgres.test.js`, `pedagogy-grades-postgres.test.js`).
9. Notes et évaluations : onze types, évaluation créée sur la classe/matière ; saisie et validation des notes, barèmes et coefficients contrôlés dans `pedagogy-grades-postgres.test.js` (dont le moteur de moyennes).
10. Persistance et non-duplication après redémarrage (`defaults22-postgres.test.js`, `migration22-postgres.test.js`), plus régression de tous les anciens modules. Les classifications facultatives ont été testées en création, modification d’annonce, lecture autorisée, refus hors périmètre, validation, rollback transactionnel et persistance.

**Ces contrôles sont locaux, et non une validation de la cible.** En préproduction, refaire la liste ci-dessus avec les comptes autorisés et une sauvegarde restaurable ; vérifier tout particulièrement qu’une année active préexistante n’est pas effacée et que la provenance des dates reste affichée.

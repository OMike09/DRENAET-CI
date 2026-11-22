# Colis 16 — Emplois du temps intelligents

## Prérequis et installation prudente

Delta **additif** sur l’application DRENAET CI existante. Dépend des migrations **001 à 015**, notamment des années/classes/affectations (014), des évaluations et surveillances (015), des comptes, notifications et droits existants. L’utilisateur indique que le colis 15 est installé sur la cible ; cela **n’a pas été vérifié par l’agent**. Vérifier réellement `schema_migrations` (versions 1–15), la version du code et l’état des données avant d’appliquer le colis ; ne jamais supposer que Render/Neon a été contrôlé.

1. Réaliser une **sauvegarde cohérente PostgreSQL**, tester sa restauration dans une base isolée et conserver les versions précédentes du code et des fichiers. Ne pas copier de secret dans l’archive ou les journaux.
2. Décompresser le ZIP **à la racine du projet existant**, sans supprimer les autres fichiers ; `npm ci` avec Node.js ≥ 20. Utiliser une connexion PostgreSQL **directe**, non poolée, au démarrage : la migration transactionnelle `migrations/016_timetables.sql` ajoute uniquement la colonne `can_timetable`, les tables et contraintes du module, et le type d’alerte `timetable`. Aucun compte, cours, note ou emploi du temps ancien n’est supprimé.
3. Vérifier `/healthz`, migrations 1–16, connexion et parcours de chaque rôle en préproduction. Ne pas restaurer mécaniquement un ancien code après des écritures en version 16 sans plan de compatibilité et restauration validée. L’agent **n’a pas déployé** ni vérifié Render/Neon.

## Parcours de configuration et de publication

1. Dans **Année scolaire**, activer une année scolaire locale, créer les classes et leurs affectations réelles (discipline + enseignant actif de l’établissement). Ne pas créer d’année, d’enseignant ou de date officielle à partir de ce module.
2. Le **chef** peut habiliter un ACE/ACES déjà muni d’une délégation académique active par *Emplois du temps → Déléguer*. Le droit supplémentaire `can_timetable` est explicite, révocable et vérifié côté serveur ; il ne découle pas automatiquement de `can_manage`, de « Mes demandes » ou du colis 15. L’ACE/ACES habilité configure, génère et corrige ; **seul le chef publie officiellement chaque nouvelle version**.
3. Configurer matin et après-midi, durées de cours, jours d’enseignement et repos. **55 minutes** et **14:00** ne sont que des valeurs initiales proposées dans le formulaire. Déclarer les pauses séparément par jour, le niveau, la série facultative et l’effectif des classes, les salles et leurs capacités. **Le chef ou l’ACE/ACES habilité valide seul les pauses par défaut.** Le chef peut activer une cosignature optionnelle avec un ACE/ACES désigné via l’API ; elle n’est pas imposée à l’établissement.
4. Déclarer les volumes par classe/disciplines et groupes, nombre de séances, durée de chaque séance, éventuellement l’effectif du groupe et une salle imposée. La discipline doit correspondre à une **affectation existante**, sans créer un enseignant fictif. Les enseignants peuvent déclarer des disponibilités/indisponibilités hebdomadaires, en attente de décision ; le chef ou ACE/ACES habilité peut les approuver ou les rejeter. Les indisponibilités datées approuvées du module surveillances sont prises en compte.
5. Choisir une plage de validité au sein de l’année locale active et lancer la génération. **Seul un brouillon** est créé ; il n’existe jamais de publication automatique. Le solveur cherche sans collision de classe/groupe, enseignant ou salle, avec pauses, jours, plages, capacités, fenêtres validées et activités/épreuves/surveillances datées ou réservations scolaires de salle. Il recherche un équilibre entre jours et matières, sans garantir un optimum mathématique. Les séances ne sont pas ajoutées si aucune solution n’existe ; le diagnostic expose classe, discipline, enseignant, minutes et séances manquantes, contraintes et pistes de correction. Une recherche trop vaste renvoie une limite de recherche, **pas** un résultat inventé. Saisir une capacité de salle réaliste et vérifier les réservations du calendrier avant de relancer.
6. Prévisualiser les vues **établissement, classe, enseignant, discipline, salle et journée** ; les pauses apparaissent séparément. La correction manuelle d’un brouillon est **autosauvegardée avec contrôle de révision** : les conflits sont listés, pas cachés. Une modification manuelle ne peut pas devenir officielle tant que les volumes/séances, plages, affectations, pauses, capacité, disponibilités et collisions ne sont pas redevenus cohérents. Après toute modification des entrées, générer à nouveau si l’empreinte du brouillon est périmée.
7. Le **chef** motive puis valide la publication : vérification complète côté serveur dans une transaction, archivage de la version officielle précédente, nouvel envoi de notifications internes aux enseignants concernés et avis aux enseignants retirés de l’ancienne version. Les anciennes versions et leurs consultations/accusés restent historisées ; les brouillons remplacés restent archivés mais ne sont pas accessibles comme des publications. Les changements d’horaires/pauses/profil après une publication exigent confirmation : l’ancien horaire reste intact jusqu’à une nouvelle publication.

## Enseignants, calendrier et suivi

L’enseignant concerné consulte sa version officielle (semaine, jour, cours/classe), imprime ou télécharge PDF/XLSX. **Ouvrir explicitement l’emploi du temps** crée une consultation ; afficher une liste ou recevoir une notification ne crée ni consultation ni accusé. **Accuser réception** est une action séparée et volontaire, horodatée et dédupliquée par version. Le suivi nominatif du responsable distingue notifications internes créées (ni preuve de remise téléphonique ni lecture), lecteurs uniques, ouvertures répétées, non-lecteurs, accusés et relances ciblées dédupliquées. Les versions remplacées sont consultables en archive ; la publication d’une nouvelle version repart avec des compteurs indépendants.

Les cours officiels récurrents sont visibles dans le calendrier académique agrégé sur la plage consultée ; les devoirs et surveillances **publiés** sont contrôlés avant génération/publication. Les nouvelles évaluations/surveillances comparent désormais leurs horaires aux cours publiés. Le **cahier de textes académique existant** reste associé aux affectations réelles ; le module ne crée pas de cours *effectivement tenus*, de cahiers remplis ni de présences fictifs. Le calendrier conserve sa limite d’intervalle de 93 jours.

## Limites opérationnelles explicites

- La génération utilise un pas de recherche de **5 minutes** et un budget de recherche borné. Si les contraintes ne peuvent pas être résolues, il faut ajuster les données ou fractionner l’organisation ; aucun horaire fictif n’est publié.
- Les réservations datées (évaluations, activités, absences et salles) qui touchent un créneau hebdomadaire bloquent ce créneau pour la version couvrant leur date ; une dérogation ponctuelle à une séance récurrente n’est pas fabriquée automatiquement.
- Le groupe est défini par son code et son effectif déclarés par les responsables ; le module ne crée ni listes nominatives de groupes ni chevauchements d’élèves simulés. Des groupes différents d’une même classe peuvent être parallèles si enseignants et salles distincts. Vérifier que les groupes sont réellement disjoints.
- Aucun message SMS/push réel n’est affirmé : les notifications sont des enregistrements internes, éventuellement relayés par les mécanismes déjà configurés. Une impression PDF de l’enseignant ne constitue pas un accusé.

## Vérification locale

Sur une **base locale jetable**, jamais Neon :

```bash
npm ci
npx playwright install chromium
# Installer les bibliothèques système requises par Chromium sur Linux.
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

Les tests créent et suppriment des bases temporaires : migrations historiques sans perte, génération et impossibilités, classes/groupes/enseignants/salles/pauses, délégation et révocation, chef seul pour la publication, brouillon conflictuel interdit, archivage et notifications, consultations répétées sans accusé implicite, exports, calendrier agrégé et navigation Chromium mobile/bureau. **Dernière suite locale complète : 42/42 tests PostgreSQL/Chromium réussis** ; résultat local uniquement, pas validation de production.

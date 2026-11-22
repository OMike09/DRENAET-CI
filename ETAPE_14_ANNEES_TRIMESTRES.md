# Colis 14 — Années et périodes scolaires, suivi pédagogique réel

## Avant installation

Ce colis est **additif** à l’application existante, version 0.13.0. Il suppose le colis 13 et les migrations 001–013 présents dans la cible. L’utilisateur indique que le colis 13 est installé ; **Render et Neon n’ont pas été consultés ni vérifiés par l’agent**. Ne jamais installer sur une base dont la version réelle n’est pas connue.

1. Relever la version actuellement déployée, faire une **sauvegarde PostgreSQL cohérente**, puis tester sa restauration dans une base isolée. Désactiver l’Auto-Deploy pendant le contrôle du delta et prévoir un retour applicatif ; ne pas supprimer les données créées après migration pour « revenir en arrière ».
2. Dans une copie/préproduction de l’application actuelle, extraire le ZIP delta **à la racine, en conservant les fichiers existants**. Ne pas décompresser comme un nouveau projet vide ni remplacer toute la base. Sous Node.js ≥20, exécuter `npm ci`. Au démarrage, le mécanisme existant applique `014_academic_year_terms.sql` en transaction via une connexion PostgreSQL directe non poolée. Une base Neon poolée ne convient pas aux migrations.
3. Créer une référence d’année avec des **dates officielles réellement décidées** par l’administration (aucune date de production n’est préchargée). Ajuster d’abord les fenêtres des périodes de référence ; ensuite créer et activer les calendriers régionaux, puis ceux des établissements, dans cet ordre. Une année active par périmètre : clôturer l’ancienne avant d’activer la suivante. Vérifier le calendrier, les droits, les notes et le suivi des notifications avec des comptes de test de différentes régions.
4. Surveiller les journaux du serveur, `/healthz`, les notifications et les modules antérieurs. Ne pas injecter les identifiants ni les données de production dans les tests automatisés.

## Périmètres et dates

- L’administrateur général crée l’année de référence AAAA-AAAA, ses dates de début/fin et 1 à 6 périodes (**3 par défaut**). Chaque période reçoit initialement une fenêtre couvrant sa part de l’année, avec composition, échéance de saisie, validation et clôture calées sur sa fin : ce sont des **valeurs initiales déclarées, à adapter avant l’ouverture**, pas des dates ministérielles présumées.
- Le directeur crée l’année régionale à partir de la référence, le chef crée celle de son établissement depuis la région. Les dates des périodes locales ne peuvent dépasser leurs bornes supérieures ; un changement de calendrier ne peut écraser une activité déjà enregistrée ni rendre un calendrier subordonné invalide. Création, activation, suspension, clôture et archivage sont contrôlés côté serveur ; les années et périodes fermées restent consultables.
- Le chef peut déléguer expressément à un ACE/ACES de **son établissement** le droit de gestion et/ou de cosignature, puis révoquer cette délégation. Sans délégation, l’ACE/ACES n’accède pas aux données scolaires locales. Si une délégation de cosignature active existe, la clôture ou la réouverture exceptionnelle locale proposée par le chef doit être approuvée par un ACE/ACES éligible. Une proposition périmée ne peut être visée. La réouverture exige un motif et une échéance exceptionnelle au plus sept jours après l’action ; elle est tracée. La fermeture interdit les nouvelles notes ordinaires, et une correction autorisée garde toutes les révisions avec motif.
- Ordre habituel : activation année de référence → année régionale → année locale ; ouverture période de référence → régionale → locale ; puis clôture période locale → régionale → référence, et clôture des années dans le même ordre ascendant. Les périodes futures ne sont pas ouvertes avant leur début. L’archivage n’efface ni les élèves, ni les notes, ni les leçons, ni les journaux.

## Activités et indicateurs

Un chef (ou ACE/ACES délégué) crée les classes et les élèves, affecte un enseignant **du même établissement** à une discipline, prévoit des événements (dont surveillance, conseil, réunion, emploi du temps) et les rapports attendus ; il peut remettre un rapport. L’enseignant affecté planifie devoirs et compositions dans la fenêtre d’évaluation, saisit les notes sur 20, motive toute correction et renseigne son cahier de textes/progression. Les moyennes affichées sont des **moyennes pondérées par coefficient et par élève/discipline**, calculées uniquement sur les notes enregistrées ; elles ne sont pas des moyennes générales ou des résultats d’examen inventés. Le tableau de bord compte les devoirs, compositions, classes réelles, notes saisies/en attente, leçons, progression et rapports non remis ; filtres établissement, classe et discipline selon le périmètre. La notion de notes « en attente » = élèves des classes affectées × devoirs enregistrés − notes enregistrées, pas une évaluation fictive pour chaque élève.

Le calendrier personnel combine les événements de l’agenda existant (y compris l’historique des annulations) avec les échéances de périodes, devoirs et événements scolaires visibles ; il n’efface pas l’ancien agenda. Les horaires créés sont des **événements datés**, pas une génération automatique d’emploi du temps récurrent ou de convocations de surveillance. Le module est un socle pédagogique minimal réel : il **n’importe pas** d’éventuelles données de notes/emplois du temps gérées ailleurs ni ne prétend produire un bulletin officiel complet.

## Notifications : mesures distinctes

Les changements de période créent des notifications **internes** adressées aux comptes éligibles ; « envoyé » signifie une ligne enregistrée dans PostgreSQL, **pas** une livraison vérifiée sur téléphone/courriel. L’ouverture d’une alerte dans la rubrique Notifications est distincte de la consultation de la fiche scolaire et de l’**accusé volontaire**. La page scolaire enregistre une consultation lors de son ouverture explicite depuis la navigation, le calendrier ou une alerte ; les actualisations automatiques ne créent pas de consultation. Le suivi de la **version actuelle** donne envois, destinataires uniques, lecteurs uniques, consultations répétées, accusés et état nominatif aux seuls responsables habilités. La relance manuelle cible les non-lecteurs ou les non-accusants ; une relance identique par version/destinataire est dédupliquée. Aucun accusé automatique, aucun chiffre de vue simulé. Un destinataire ne voit que son propre suivi.

## Validation locale et limites

Commande sur **une base PostgreSQL locale dédiée aux tests**, jamais Neon :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_DE_TEST' npm test
```

Les tests créent puis suppriment des bases temporaires : le compte local de test doit en avoir le droit. Vérifications : hiérarchie admin/directeur/chef/ACE/enseignant et autre région, fenêtres temporelles, délégations et cosignature, devoirs/notes révisées, rapports, suivi sent/view/ack/relances, calendrier, archive d’année et de trimestre, migrations depuis des versions antérieures et parcours Chromium. **39/39 tests PostgreSQL/Chromium réussis localement, aucun ignoré**. Cela ne constitue **ni un déploiement**, ni une vérification de la base de production. Les données historiques initialement absentes ne sont pas recréées artificiellement.

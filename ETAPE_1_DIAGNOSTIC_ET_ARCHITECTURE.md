# DRENAET CI — diagnostic et architecture de l’étape 1

## 1. Constat avant modification

À l'adresse publique `https://drenaet-ci.onrender.com`, la racine affiche **EDUC CI — APK** et propose un fichier Android. Les URL `/healthz` et `/api/me` renvoient la même page HTML, et non une vérification de base ou de session. Cette page publie des comptes et mots de passe de démonstration, dont un administrateur : **ne pas les considérer comme des identifiants sécurisés**. L'APK téléchargé a été inspecté comme archive, **sans être exécuté** : ses fichiers embarquent une interface HTML/CSS/JavaScript, une liste de données fictives incluant élèves/notes et un stockage `EDUCStore` ou `localStorage` sous la clé `educdb_v1`. Aucun appel réseau à un backend de gestion n'a été trouvé dans ces fichiers.

**Conclusion limitée :** l'URL et l'APK observés ne constituent pas la base web multi-utilisateurs, persistante et sécurisée du cahier des charges. Les données réelles éventuellement présentes sur des appareils utilisant cet APK ne sont pas visibles depuis Render et **ne sont ni sauvegardées, ni migrées, ni effacées** par le projet présent. Le propriétaire indique qu'il existe des données à reprendre ou conserver : avant une migration, il faut inventorier appareils, versions d'APK, données, consentements et sauvegardes, en évitant d'importer des dossiers d'élèves dans une version qui les exclut.

La personne propriétaire indique qu'un **PostgreSQL est préparé** sur Render, mais aucun accès à sa configuration ou à la base n'a été fourni. Cette affirmation n'a pas été testée sur Render. La nouvelle application est développée en dossier indépendant, sans écraser l'ancien service.

## 2. Architecture retenue pour la nouvelle application

- **Web responsive**, backend Node.js/Express, PostgreSQL obligatoire et schéma propre `drenaet_ci` pour éviter toute collision avec des tables d'une autre application.
- Organisation : direction régionale (`region`) → unités rattachées (`school` et `service`). Chaque compte actif possède un rôle, une unité et une région (sauf l'administrateur général). Les requêtes de liste, de statistiques et de modification calculent le périmètre **côté serveur**.
- Les clés de rôle sécurisées sont stables ; leurs intitulés sont modifiables par l'administration générale. Un directeur régional ne peut pas créer un autre directeur régional ou un administrateur général ; un chef d'établissement ne peut pas s'attribuer un autre rôle ni gérer un autre établissement. L'administrateur général initial n'est créé que si le schéma de cette application ne comporte encore aucun compte.
- Les dossiers d'instructions, tâches, rapports, documents, conversations et notifications auront des entités séparées. Une « vue » ne sera pas synonyme de « reçu » ou de « validé ». Pour les futurs circuits, prévoir une étape de validation configurable par type de rapport, un objet d'ordre immuable et ses événements d'exécution append-only avec horodatages et auteur.
- Les accès doivent combiner rôle, région, établissement/service, autorité réelle, audience et état de l'objet. Le simple masquage d'un bouton n'est jamais une autorisation.
- Identifiant ou numéro unique, invitation par code temporaire non stocké en clair, création du secret au premier accès, sessions et CSRF, suspension avec invalidation de sessions, journal d'audit append-only.

### Vocabulaire institutionnel à valider

Le nom de produit demandé est **DRENAET CI**. Dans les documents du ministère consultés, la direction régionale apparaît aussi sous l'abréviation **DRENA** ; ne pas rebaptiser arbitrairement l'entité administrative officielle. Le ministère emploie **ACE** pour « Adjoint au Chef d'Établissement », distinct d'un coordinateur éducatif. En conséquence, l'étape 1 propose « Adjoint au chef d'établissement (ACE) » et un rôle séparé « Coordination éducative » dont l'appellation/missions restent à faire confirmer par le propriétaire et les services compétents.

Références publiques consultées :
- Ministère, « Inauguration de la nouvelle DRENA de Boundiali » : https://www.education.gouv.ci/index.php/Activite/details/274
- Ministère, « Les concours professionnels et examens pédagogiques » (ACE) : https://www.education.gouv.ci/index.php/Activite/details/313
- Ministère, guide méthodologique du projet éducatif (ACE) : https://www.education.gouv.ci/assets/pdf/Reseau/Gouvernance/fichier_15.pdf

Aucun logo, sceau ou reconnaissance officielle du ministère n'est présumé : identité provisoire neutre en attendant les ressources et autorisations validées.

## 3. Livraison effective de l’étape 1

Fonctions utilisables : authentification, activation par code, mot de passe personnel, régions, établissements et services, comptes et affectations, suspension/réactivation, régénération de code, profil, changement de mot de passe, tableau de bord de périmètre, journal de direction, intitulés de fonctions ajustables par API générale. Les tests réels couvrent les refus d'escalade, le cloisonnement entre deux régions, l'invalidation des sessions et la conservation des données après redémarrage PostgreSQL local. Un navigateur Chromium réel a testé l'interface ordinateur et mobile.

**Non livrés dans cette étape :** transmission d'instructions, tâches, messagerie, dossiers, courriers, réunions, rapports, fichiers PDF, emploi du temps, cahier de textes, statistiques pédagogiques, exports, notifications push, application APK ou PWA installable. Aucun bouton ne simule ces fonctions.

### Critères d'acceptation par étapes futures

**Étape 2 — instruction et mission.** Objet, émetteur, audience sélectionnée parmi ses subordonnés, échéance/priorité, transitions de statut et accusé par destinataire, réponse/rapport, suivi du supérieur ; refuser toute modification ou suppression par le destinataire. Séparer « transmettre » d'une nouvelle instruction indépendante et auditer les deux. Tests multi-région et multi-établissement obligatoires.

**Étape 3 — échanges, rapports et documents.** Messagerie séparée du circuit officiel ; pièces jointes privées, taille/type/antivirus selon moyens disponibles, archivage, accès révocable. Rapports versionnés avec circuit configurable par nature, validation/rejet motivé et correction sans perte de preuve ; calendrier filtré par audience. Les données de personnel seulement sont autorisées ; toute donnée sur des élèves devra faire l'objet d'une décision et d'une protection distinctes.

**Étape 4 — pilotage et diffusion.** Statistiques calculées sur données réelles, exports PDF/Excel autorisés et traçables, notifications persistées puis Web Push selon consentement et plateformes, sauvegardes automatiques hors du Web Service et tests de restauration, essais de déploiement et d'usage réel avant annonce de disponibilité.

## 4. Points à vérifier avant une mise en production

1. Identifier le dépôt réellement relié à `drenaet-ci.onrender.com` et décider si la nouvelle application doit utiliser un **autre Web Service**. L'ancien site/APK reste intact pour l'instant.
2. Confirmer **sans divulguer de secret** que le PostgreSQL de destination est adapté, actif et sauvegardé ; préserver toutes les variables privées Render existantes. Le schéma nouveau est isolé mais un contrat de sauvegarde reste nécessaire.
3. Définir l'identité institutionnelle autorisée, la liste des régions et établissements à importer, les responsables ayant droit d'ouvrir les premiers comptes et la correspondance exacte des fonctions/ordres hiérarchiques.
4. Recenser les données de l'APK sur les appareils, obtenir un export de test **anonymisé** et décider ce qui peut légalement être repris dans cette version sans élèves/parents. Pas de suppression avant sauvegarde vérifiée et migration testée.
5. Tester sur le service Render cible avec de vrais comptes autorisés, sur téléphone et ordinateur, puis après redémarrage/redéploiement, sans réutiliser les mots de passe publiés par la page de démonstration actuelle.

**Aucune donnée de production, aucun compte Render, aucune variable secrète n'a été consulté ou modifié pendant cette étape.**

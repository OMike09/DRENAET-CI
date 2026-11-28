# Audit 30 — annonce officielle, parcours multi-rôles et portail parent

## Portée et preuve

Examen de la capture fournie (`image-5.png`) et du code existant, correction ciblée du doublon d’affichage, vérification des routes de communication et de l’espace parent, puis exécution des tests PostgreSQL local/Chromium sur bases temporaires. Le parcours automatisé `identity23-browser.test.js` visite les rubriques accessibles aux 15 fonctions professionnelles de la matrice existante ; `parents-governance-postgres.test.js` couvre le seizième profil, parent, sur mobile et bureau. Les autres scénarios couvrent notamment droits, données persistantes, annonces, demandes, emplois du temps, inscriptions, notes, pointage, dossiers, messagerie, fichiers et migrations. **Visiter une rubrique ou passer une suite de régression n’équivaut pas à cliquer chaque bouton dans tous les états métier.** Aucun accès au site, à Render ni à sa base de production ; son fonctionnement actuel reste inconnu.

## Défauts confirmés et changements

1. **Libellé « Annonce officielle » répété dans l’annonce ouverte.** La fenêtre portait « Annonce officielle · titre » et la carte interne répétait « Annonce officielle · catégorie ». La fenêtre porte désormais une seule fois « Annonce officielle », la carte conserve le titre de la publication et indique uniquement la catégorie. Assertion Chromium du libellé unique sur annonce publiée, côté destinataire et côté parent.
2. **Annonce destinée à un parent impossible à consulter.** Un administrateur général ou directeur régional pouvait sélectionner un compte parent comme destinataire d’une annonce officielle, mais le pare-feu API du parent refusait la liste et le détail ; son portail n’offrait pas la rubrique Annonces. Le parent peut désormais consulter **uniquement** les annonces officiellement reçues et accessibles, télécharger leurs pièces visibles et accuser réception après ouverture. Le portail ajoute l’entrée Annonces, sans accès aux demandes privées, à l’administration des pièces, aux suivis ou aux actions de publication. Pas de migration ni d’import automatique d’anciennes données.
3. **Navigation des filtres du parent.** Lors du chargement de la rubrique, l’état du filtre est préservé pour les filtres autorisés (`Reçues`, `Urgentes`, etc.) ; les onglets non pertinents de création/demandes sont masqués. Test navigateur : changement d’onglet, retour, ouverture et accusé effectif.
4. **État de consultation périmé dans la liste.** Ouvrir puis accuser une annonce mettait bien à jour PostgreSQL, mais la liste affichait encore l’ancien statut jusqu’à un rechargement. L’ouverture synchronise désormais l’état visible (`Consultée`/`Accusée réception`) avec le résultat contrôlé de l’API. Vérification Chromium de l’étiquette après accusé.

## Vérifications des autorisations

- Administrateur → parent : création d’un brouillon nominatif, pièce PDF visible et pièce PDF masquée, publication ; le parent ne voit pas le brouillon avant publication, retrouve l’annonce publiée, lit la pièce autorisée et ne peut pas lire la pièce masquée.
- Parent : refus HTTP des routes de suivi, de réglages de fichiers et d’archivage ; accès au détail nominatif seulement après publication ; l’accusé horodaté est enregistré après lecture. Les contrôles d’accès existants de `communications.js` sont conservés : la seule extension du pare-feu parent concerne GET liste/détail/style/pièces et POST accusé.
- Établissement/enseignant : publication d’annonce, image, réorganisation, masquage, lecture, téléchargement et accusé dans Chromium ; navigateur vérifie également l’unicité du libellé.
- Suite des rôles : administration générale, direction régionale, secrétariat/personnel régional, inspection, chef et adjoint, coordination, ACE/ACES, économat, éducation, enseignement, personnel scolaire, responsable/personnel de service, parent. Certains parcours sont couverts par des tests d’intégration, d’autres seulement par navigation et contrôles statiques : **aucune certification exhaustive par rôle et tâche**.

## Résultat réel des tests

- `node --check` sur les fichiers JavaScript modifiés : conforme.
- Tests ciblés PostgreSQL + Chromium : annonces et parent réussis.
- Suite complète finale locale `AC_RUN_BROWSER_TESTS=1 npm test` avec PostgreSQL de test : **61/61 réussis**, fichier `/home/user/drenaet-audit30-61-delivery.log`.
- Une première suite a produit **60/61** sur une attente de navigation `my-attendance` dans `identity23-browser.test.js` (timeout). Ce test a ensuite réussi seul et les deux suites complètes suivantes ont réussi 61/61. Ce cas intermittent n’a pas été reproduit comme anomalie fonctionnelle déterministe ; il reste à surveiller, sans prétendre l’avoir corrigé.

## Installation et limites

Colis 30 = correctif incrémental **après les colis 26, 27, 28 et 29**, pas une application autonome. Remplacer seulement les fichiers présents dans ce delta sur une sauvegarde du projet. Aucune nouvelle migration, aucun changement des données ou des tables. La version `0.30.0` dans `package.json` et `/healthz` permet de voir si le nouveau serveur s’est réellement chargé ; `/healthz` n’existe pas si le service ne démarre pas. Vérifier `/readyz` ponctuellement pour la disponibilité DB. Ne pas publier de secrets. Un quota PostgreSQL épuisé, une ancienne version déployée ou un service Render suspendu ne sont pas réparés par ce ZIP. Si des boutons restent bloqués dans l’environnement réel, transmettre pour chacun : fonction, page, action exacte, résultat attendu/obtenu, version affichée par `/healthz` et statut HTTP/erreur de console **sans cookies, identifiants ni données d’élèves**. L’extension exhaustive de tous les parcours métier et la validation en production restent à réaliser avec accès à un environnement réel et scénarios précis.

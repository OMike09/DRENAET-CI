# DRENAET CI — audit méthodique en cours (lot 31)

> **Ce document est un état d’avancement, pas une recette finale.** L’utilisateur a confirmé qu’aucune préproduction n’est disponible pour l’instant. Aucune authentification, création, modification ou suppression n’a été faite sur le site Render ; les tests avec comptes fictifs utilisent exclusivement des bases PostgreSQL locales jetables. Les résultats locaux ne certifient pas le déploiement ni les données réelles.

## État constaté sur le site communiqué

- `https://drenaet-ci.onrender.com/healthz` : HTTP 200, `version: 0.29.0`. Le colis 30, ainsi que les changements du présent lot 31, **ne sont pas chargés** sur cette instance.
- `/readyz` : HTTP 200, `status: ok` à l’instant du contrôle, sans garantie permanente.
- Chromium, connexion publique **sans tentative de connexion** : bureau 1366 × 768 et mobile simulé 390 × 844, HTTP 200, page chargée sans erreur JavaScript, sans débordement horizontal mesuré. Dans les deux cas : un champ mot de passe, **aucun œil d’affichage**, **aucune option « Mot de passe oublié ? »**.
- Lecture anonyme contrôlée : `/api/auth/session` retourne `user:null`, `/api/accounts`, `/api/communications/announcements` et `/api/parents/children` renvoient HTTP 401. `/api/ui/brand` est publiquement consultable selon le code existant. Aucune permission authentifiée de production n’a été testée.

## Corrections locales vérifiées dans ce lot

1. **Afficher/masquer le mot de passe** sur les champs générés par l’application : bouton œil accessible (libellés « Afficher le mot de passe » / « Masquer le mot de passe »), clavier et clic, sans perte de saisie ni enregistrement du texte par ce composant. Concerne connexion, activation, définition après code temporaire, changement du mot de passe professionnel et profil parent. Contrôles Chromium bureau/mobile sur ces états et régression locale complète. Le mot de passe reste haché côté serveur (mécanisme existant, non modifié).
2. **Orientation « Mot de passe oublié ? »** sur l’écran de connexion : le bouton explique le circuit **existant** de vérification par un responsable habilité et de code temporaire. Aucun envoi automatique ni prétention de réinitialisation autonome : il n’existe pas de canal de vérification de l’identité configuré pour cela. Le parcours existant de réinitialisation avec code à durée limitée a été réalisé dans Chromium : responsable habilité → code → nouveau mot de passe → connexion. Le bouton « Code temporaire » du module Acteurs, et non l’ancien écran de comptes, est le vrai parcours utilisé.
3. **Couverture instrumentée des rubriques** : le test de navigation enregistre maintenant le nombre de rubriques distinctes réellement ouvertes selon les comptes locaux, sans transformer un simple affichage en preuve que les boutons fonctionnent.

## Résultats exécutés (copie locale)

- Suite complète PostgreSQL local jetable + Chromium : **61 tests réussis / 61**, journal `/home/user/drenaet-audit31-61-final.log`.
- Navigation à travers les comptes fictifs des 15 fonctions professionnelles : **39 rubriques distinctes ouvertes au total**, dont 35 pour administrateur général, 33 directeur régional, 32 chef d’établissement, 28 enseignant ; pour les 11 autres fonctions, le scénario de balayage est limité à **4 rubriques par fonction**. Ce décompte est celui des pages parcourues, **pas** des fonctionnalités approuvées.
- Parent : les parcours mobile/bureau (enfants, profil, annonces) et l’accès nominatif/accusé sont dans `tests/parents-governance-postgres.test.js` ; œil vérifié sur son profil.
- Parcours authentification ciblés effectivement réalisés : connexion, invitation/activation, récupération *par code émis par un responsable*, changement de mot de passe après code, affichage/masquage sur les formulaires mentionnés, déconnexion. Il n’y a pas de test de tous les états et boutons de tous les modules.
- Appareils : bureau, tablette (viewport 768 px) et téléphone simulés dans Chromium. **Ni téléphone Android physique ni Safari/iPhone réel testés** ; WebKit n’est pas installé dans l’environnement local.

## Tableau de contrôle honnête — fonctionnalités ciblées, pas « Toutes »

| Rôle | Fonctionnalités réellement testées localement | Fonctionnelles et testées / corrigées | Restantes ou non testables |
|---|---|---|---|
| Administrateur général | 35 rubriques ouvertes ; création région et compte, code temporaire, annonces et styles dans scénarios ciblés | Fonctionnelle et testée localement pour ces parcours ; œil et aide à la récupération **fonctionnels après correction locale** | Chaque bouton/paramètre hors scénarios ; statistiques confrontées aux données de production : **non testable faute d’accès** |
| Directeur régional | 33 rubriques ouvertes, connexion/activation, permissions multi-régions, annonces dans les tests existants | Fonctionnelle et testée localement pour ces scénarios | Parcours complet de chaque formulaire et export : **non testé** ; production authentifiée : **non testable faute d’accès** |
| Inspecteur pédagogique | 4 rubriques ouvertes ; autorisations disciplinaires de consultation leçons/notes testées par API | Fonctionnelle et testée localement pour les contrôles documentés | Rapports d’inspection, recommandations, UI de chaque discipline : **non testés exhaustivement** |
| Chef d’établissement | 32 rubriques ouvertes ; emplois du temps validés, rôles, annonces, dossiers COGES/examens dans scénarios existants | Fonctionnelle et testée localement pour les scénarios exécutés | Tous les écrans de vie scolaire et toutes les actions d’administration : **non testés exhaustivement** |
| ACE/ACES | 4 rubriques ouvertes par balayage ; délégation/préparation d’emploi du temps et refus de validation finale testés par intégration | Fonctionnelle et testée localement pour ces scénarios | Autres boutons du portail ACE : **non testés exhaustivement** |
| Éducateur | 4 rubriques ouvertes par balayage ; liens parent/élève et appels dans scénarios API | Fonctionnelle et testée localement pour les scénarios exécutés | Convocations et chemin complet signalement → éducateur → réponse sur chaque état : **non testés exhaustivement** |
| Enseignant | 28 rubriques ouvertes ; annonces, cahier pédagogique, notes, appels, emploi du temps selon suites spécialisées | Fonctionnelle et testée localement pour les scénarios exécutés | Toutes les variantes de leçons/notes et toutes les erreurs de formulaire : **non testées exhaustivement** |
| Parent | Portail enfants/profil/annonces en navigateur ; confidentialité, publications et accusé par API | Fonctionnelle et testée localement pour ces scénarios ; œil du profil **fonctionnel après correction locale** | Plusieurs enfants simultanés, convocations et notifications parent spécifiques : **incomplètes ou non testées** ; production : **non testable faute d’accès** |
| COGES | Dossiers COGES via chef/direction, refus et visas dans les tests existants | Fonctionnelle et testée localement pour les dossiers exécutés | **Aucun rôle de compte `COGES` distinct dans la matrice actuelle** : accès autonome des membres **non développé/non testable** sans décision sur la hiérarchie prévue |

## Problèmes et limites restant à traiter

- **Dépendance externe :** Render fonctionne actuellement en version `0.29.0`, pas les correctifs 30/31. Un ZIP local ne déploie pas le site. Aucun accès de test authentifié ni préproduction disponible.
- **Récupération autonome :** l’option ajoutée est une orientation vers une vérification d’identité par responsable ; **aucune réinitialisation autonome** par courriel/SMS n’a été développée, faute de canal de vérification et de règles d’authentification adaptés. Ne pas collecter de données privées ni proposer de lien devinable pour la simuler.
- **Alertes du parent et réponses :** le portail parent actuel reçoit des annonces et affiche les réponses dans le dossier enfant, mais le circuit de notification des réponses parent et son suivi dédié n’a pas été qualifié de bout en bout ; statut **incomplet / à approfondir**, pas « fonctionnel ».
- **Comptes COGES :** absence de rôle spécifique dans `security.js` ; ne pas créer un rôle ni modifier les permissions sans définir l’autorité de rattachement, la confidentialité et les opérations autorisées.
- **Test exhaustif des rubriques :** seules certaines actions ont des scénarios complets. Actions non testées de bout en bout sur tous rôles : recherche/pagination de chaque liste, suppression dans tous états, notifications multi-modules, indicateurs confrontés aux données réelles, sauvegardes automatiques, pièces sur tout type de dossier, exports sur appareils physiques, tests d’accessibilité et Safari/iPhone. Elles sont **non testées**, pas certifiées.
- Le colis 30 corrige la répétition « Annonce officielle » et l’accès des parents aux annonces **localement**, mais le site en version 0.29.0 ne les intègre pas encore.

## Prochaine validation nécessaire

Déployer d’abord le lot **cumulatif 31 après le colis 29** sur une préproduction isolée et y créer des comptes de test dédiés. L’utilisateur a indiqué qu’une telle préproduction n’existe pas encore. En attendant, aucune opération d’écriture ne doit être faite sur la production. Quand elle sera disponible, reprendre ce tableau action par action, vérifier les changements en base de test et après actualisation, puis seulement envisager le déploiement. Ce rapport **ne clôt pas l’audit demandé**.

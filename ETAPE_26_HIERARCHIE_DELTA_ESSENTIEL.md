# Étape 26 — hiérarchie régionale, structures et établissements (delta essentiel)

## Installation prudente

Ce ZIP est un **delta de code**, pas une application autonome. L'appliquer à la racine d'un projet **colis 25 complet/essentiel déjà installé et fonctionnel** (ainsi que ses prérequis). Sauvegarder la base PostgreSQL et le projet avant toute opération ; vérifier le manifeste SHA-256 et les conflits de versions ; ne supprimer aucun ancien fichier ni donnée. Ne pas appliquer sur une autre branche sans comparer les différences. `npm ci` puis démarrer avec une connexion PostgreSQL **directe non poolée** ; la migration additive `025_hierarchy.sql` se lance au démarrage si absente. Effectuer d'abord ces opérations dans une base de préproduction copiée/anonymisée, avec possibilité de retour arrière. **Aucun accès à Render, Neon ou à la base réelle n'a été utilisé ici.**

## Ce qui est effectivement livré

- Administrateur général : contrôle national des comptes, organigrammes, unités, journaux et tableaux existants ; son droit national n'est plus supprimable dans la matrice des comptes. DRENAET : administration et consultations dans **sa** région, jamais automatiquement dans une autre.
- Catalogue **indicatif et inactif par unité** des fonctions régionales, IEPP, APFC, CIO, CAFOP, scolaires et autres ; fonctions supplémentaires configurables, qualification facultative d'une structure/école, affectation nominative d'un compte à un poste **activé**. Aucune création automatique de postes ou de structures par région ; pas de rattachement d'« Inspecteur général » inventé.
- Trois rapports distincts et auditables : supérieur administratif, supervision pédagogique et mission fonctionnelle. Plusieurs missions possibles, un supérieur administratif actif à la fois ; circuits école–structure à déclarer explicitement ; les changements de compte, fonction ou circuit terminent les droits liés et invalident les sessions concernées. Les historiques et les comptes restent conservés.
- Autorisations complémentaires **par poste activé**, facultatives et explicites, avec lien nominatif, périmètre et contrôle serveur pour l'administration des comptes. Les rôles techniques existants, les attributions des enseignants, éducateurs et inspecteurs et les gardes des cahiers restent en place. Les liens fonctionnels ou pédagogiques ne donnent **pas** accès à l'administration des comptes ni aux notes par simple intitulé.
- Menu « Mon équipe », organigramme repliable, profils/dépendants, tâches en attente, suivi administratif, pointages visibles dans le périmètre, instructions nominatives et rapports approuvés ; tableau de bord professionnel et suivi d'unité ; vues ordinateur/téléphone. Pour l'éducateur principal affecté et rattaché administrativement à un éducateur, consultation **en lecture seule** des appels validés de ce collaborateur.
- Création et mutation : sélection facultative du poste activé et du supérieur autorisé ; réaffectation invalide les sessions et révoque les postes, liens et délégations explicitement connus (inspection, appel, pointage, enseignement délégué), sans détruire les anciennes données.

## Paramétrage réel obligatoire

1. Pour chaque DRENAET, **vérifier** les structures existantes et leur type avant qualification ; ne pas créer toutes les IEPP/APFC/CIO/CAFOP par défaut.
2. Activer les seules fonctions attestées dans chaque unité ; affecter les comptes existants correspondants sans les recréer ; déclarer les supérieurs, circuits officiels d'inspection et périmètres pédagogiques, puis les éventuelles délégations d'administration **poste/rôle/action**.
3. Contrôler les comptes à plusieurs responsabilités et les dépendances externes avec l'autorité compétente ; les intitulés d'école, d'inspection ou de fonction ne prouvent pas à eux seuls un rapport réglementaire.
4. Tester dans la cible les rôles et dossiers réels, y compris les données antérieures, le départ/remplacement des responsables, les revocations, l'accès d'un directeur étranger et la reconnexion. Les tests locaux ne dispensent pas d'une recette institutionnelle.

## Limites explicites

La migration ne devine **aucun** organigramme officiel ni aucun rattachement nominatif préexistant. Elle ne corrige pas automatiquement les erreurs présentes dans la base réelle : elles doivent être identifiées et reprises par les autorités habilitées, avec audit. Les postes sont des fonctions **configurables**, non une déclaration de postes réglementaires existants. Les workflows spécialisés IEPP/APFC/CIO, les validations de documents propres à chaque service et un mécanisme dédié de remplacement temporaire daté ne sont **pas intégralement couverts** par les modules génériques de hiérarchie ; les modules de formation, orientation, inspection et courrier existants conservent leurs gardes propres. Un lien hiérarchique ne les contourne pas. Ne pas annoncer de conformité réglementaire ou de déploiement en production sur cette seule base.

## Essais locaux

La suite complète sur PostgreSQL isolé et Chromium (ordinateur/mobile) a réussi **59/59** après l'intégration de la hiérarchie. Le test ajouté couvre l'isolation interrégionale/interstructure, postes opt-in, lien de coordination du secrétaire général vers un chef de structure, éducateur principal, poste et circuit révoqués, délégations, mutation et persistance au redémarrage. Les tests antérieurs couvrent notamment l'isolation des notes entre enseignants. Le delta inclut le nouveau test hiérarchique et les assertions de migration des tests existants mises à jour pour la version 025. Ne lancer `npm test` que sur une base locale jetable (`TEST_DATABASE_URL`), jamais sur Neon/production. Le journal complet n'est pas dans le delta essentiel ; il reste disponible dans le dossier de travail à la demande.

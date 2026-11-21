# DRENAET CI — étapes 1–9

Application web institutionnelle distincte de l'ancien essai APK. Étapes 1–4 : comptes et hiérarchie, instructions, missions, messagerie privée, rapports à circuits configurables, bibliothèque privée et calendrier. **Étapes 5–8 : statistiques et alertes, push volontaire, pièces privées, courriers et groupes. Étape 9 : rappels et exports CSV, PDF, Excel.** Aucun compte élève ou parent en v1.

**Statut : colis 9 développé et testé localement avec PostgreSQL et Chromium mobile simulé ; non déployé en production par l’agent.** Le dernier déploiement public confirmé affichait les étapes 1 à 6 ; les colis 7, 8 et 9 ne sont pas déclarés installés sur Render. Aucun accès privé à Neon ou aux sauvegardes de production. Voir [ETAPE_9_RAPPELS_EXPORTS.md](ETAPE_9_RAPPELS_EXPORTS.md).

## Fonctions vérifiées dans les sources

- Comptes nominatifs, sessions HTTP-only, CSRF, affectations et rôle contrôlés côté serveur, suspension, audit. Administrateur général séparé des directeurs régionaux.
- Instructions et missions traçables et alertes internes propres à leurs événements.
- Messages privés entre personnes autorisées et rapports à circuits hiérarchiques configurables, versions et décisions conservées.
- Bibliothèque PDF/PNG/JPEG (2 Mio par fichier, dans PostgreSQL) privée, établissement, région ou générale selon l'autorité de l'auteur ; calendrier à visibilité équivalente, modifications historisées et annulations non destructrices.
- Nouvelle page Statistiques : comptes et établissements actifs, instructions, missions, rapports, documents **accessibles** et événements à venir. Filtres de 30/90/365 jours pour les activités datées ; vue globale pour l'administrateur, vue régionale pour un directeur, vue des éléments accessibles à titre individuel pour les autres. Aucun contenu privé, nom de personne ou résultat d'élève n'est exposé par ces agrégats.
- Rubrique Notifications unifiée : alertes des instructions/missions existantes, ainsi que nouveaux messages, étapes de rapports, publications documentaires et événements d'agenda. Création **dans les mêmes transactions que les opérations réussies**, ciblage par rôle/région/établissement, clé de déduplication par événement, filtre des documents archivés ou devenus inaccessibles. Consultation de la liste **sans marquer Ouvert** ; ouverture du contenu puis confirmation côté serveur. Compteur et états persistants.
- Push web **facultatif** par appareil et session : activation volontaire et révocation dans Mon profil, clés VAPID configurées uniquement en privé, file transactionnelle persistante pour nouvelles alertes, avis génériques sans données sensibles, arrêt à la déconnexion/suspension et après expiration. Nécessite HTTPS et validation réelle sur chaque appareil visé.
- **Pièces jointes privées aux instructions, missions et rapports** (PDF, images et audio/notes vocales) : droits des participants vérifiés à chaque accès, réglage général 1–10 Mio par fichier / 20–250 Mio cumulés ; historique conservé sans antivirus intégré.
- **Courriers** : registre entrant/sortant, recherche, fichier privé, transmissions nominatives et accusé de réception ; **groupes privés** créés par les responsables, messages et adhésions tracés.
- **Rappels** : échéances des instructions reçues, missions confiées et événements accessibles ; génération périodique et à la consultation, préférences personnelles, sans doublons pour une même échéance. **Exports** des listes accessibles et statistiques en CSV/PDF/Excel, limités, filtrés et audités.
- PostgreSQL obligatoire, schéma isolé `drenaet_ci`, migrations versionnées 001 à 009. Les données antérieures restent présentes ; aucune migration d'APK ni effacement automatique.

**Limites :** aucune donnée d'élèves/notes en v1, donc pas d'indicateurs pédagogiques de résultats sans source et définition validées. Le push web n'est ni push natif APK, ni accusé de réception réel ; aucun son système, courriel, rappel automatique, pièce jointe aux messages privés ni antivirus des fichiers. Les notifications d'activité ne sont pas générées rétroactivement pour d'anciens événements ; les anciennes notifications d'instruction/mission sont conservées. Un service gratuit en veille, les autorisations navigateur et l'expiration des sessions limitent la livraison ; pas de test physique ou de garantie sur téléphone.

## Installer le delta du colis 9 après le colis 8

Lire [le guide du colis 9](ETAPE_9_RAPPELS_EXPORTS.md) et confirmer que **les colis 1 à 8** sont déjà installés dans le dépôt et la base visée. Avant tout redéploiement : sauvegarde/restauration vérifiée, copie des seuls fichiers du ZIP aux mêmes chemins, sans effacer les fichiers supplémentaires. Installer avec `npm ci` (Node.js >=20) ; la migration 009 s’applique automatiquement au démarrage avec une connexion PostgreSQL directe non poolée. Ne publier aucun secret. Ne pas activer `DRENAET_ALLOW_PREVIEW=1` en production.

Tests **locaux uniquement** : `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<base PostgreSQL locale de test> npm test` après installation de Chromium Playwright. **28/28 tests réussis** sur PostgreSQL jetable et Chromium simulé. Ne jamais utiliser la production comme `TEST_DATABASE_URL`. Aucun déploiement du colis 9 ni test authentifié en production n’a été effectué par l’agent.

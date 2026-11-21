# DRENAET CI — étapes 1–7

Application web institutionnelle distincte de l'ancien essai APK. Étapes 1–4 : comptes et hiérarchie, instructions, missions, messagerie privée, rapports à circuits configurables, bibliothèque privée et calendrier. **Étape 5 : indicateurs d'activité et notifications internes. Étape 6 : push web volontaire. Étape 7 : pièces jointes privées et notes vocales.** Aucun compte élève ou parent en v1.

**Statut : colis 7 développé et testé localement avec PostgreSQL et Chromium à microphone simulé.** Le déploiement public confirmé précédemment affichait les étapes 1 à 6 ; le colis 7 n'a pas été déployé ni testé avec des comptes de production. Aucun accès privé à Neon ni aux sauvegardes de production par l'agent. Voir [ETAPE_7_PIECES_JOINTES_NOTES_VOCALES.md](ETAPE_7_PIECES_JOINTES_NOTES_VOCALES.md).

## Fonctions vérifiées dans les sources

- Comptes nominatifs, sessions HTTP-only, CSRF, affectations et rôle contrôlés côté serveur, suspension, audit. Administrateur général séparé des directeurs régionaux.
- Instructions et missions traçables et alertes internes propres à leurs événements.
- Messages privés entre personnes autorisées et rapports à circuits hiérarchiques configurables, versions et décisions conservées.
- Bibliothèque PDF/PNG/JPEG (2 Mio par fichier, dans PostgreSQL) privée, établissement, région ou générale selon l'autorité de l'auteur ; calendrier à visibilité équivalente, modifications historisées et annulations non destructrices.
- Nouvelle page Statistiques : comptes et établissements actifs, instructions, missions, rapports, documents **accessibles** et événements à venir. Filtres de 30/90/365 jours pour les activités datées ; vue globale pour l'administrateur, vue régionale pour un directeur, vue des éléments accessibles à titre individuel pour les autres. Aucun contenu privé, nom de personne ou résultat d'élève n'est exposé par ces agrégats.
- Rubrique Notifications unifiée : alertes des instructions/missions existantes, ainsi que nouveaux messages, étapes de rapports, publications documentaires et événements d'agenda. Création **dans les mêmes transactions que les opérations réussies**, ciblage par rôle/région/établissement, clé de déduplication par événement, filtre des documents archivés ou devenus inaccessibles. Consultation de la liste **sans marquer Ouvert** ; ouverture du contenu puis confirmation côté serveur. Compteur et états persistants.
- Push web **facultatif** par appareil et session : activation volontaire et révocation dans Mon profil, clés VAPID configurées uniquement en privé, file transactionnelle persistante pour nouvelles alertes, avis génériques sans données sensibles, arrêt à la déconnexion/suspension et après expiration. Nécessite HTTPS et validation réelle sur chaque appareil visé.
- **Pièces jointes privées aux instructions, missions et rapports** (PDF, images et audio/notes vocales) : droits des participants vérifiés à chaque accès, réglage général 1–10 Mio par fichier / 20–250 Mio cumulés ; historique conservé sans antivirus intégré.
- PostgreSQL obligatoire, schéma isolé `drenaet_ci`, migrations versionnées 001 à 007. Les données antérieures restent présentes ; aucune migration d'APK ni effacement automatique.

**Limites :** aucune donnée d'élèves/notes en v1, donc pas d'indicateurs pédagogiques de résultats sans source et définition validées. Le push web n'est ni push natif APK, ni accusé de réception réel ; aucun son système, courriel, rappel automatique, pièce jointe aux messages privés ni antivirus des fichiers. Les notifications d'activité ne sont pas générées rétroactivement pour d'anciens événements ; les anciennes notifications d'instruction/mission sont conservées. Un service gratuit en veille, les autorisations navigateur et l'expiration des sessions limitent la livraison ; pas de test physique ou de garantie sur téléphone.

## Installer le delta du colis 7 après le colis 6

Suivre [le guide du colis 7](ETAPE_7_PIECES_JOINTES_NOTES_VOCALES.md) : sauvegarde et restauration vérifiées, inventaire des colis 1–6, capacité PostgreSQL suffisante, copie des seuls fichiers du ZIP aux mêmes chemins, `npm ci`, redémarrage et migration 007 automatique. Le delta ne fonctionne **pas seul** ; conserver les fichiers supplémentaires du dépôt. Ne jamais publier de secrets. La connexion doit rester directe, non poolée, et `DRENAET_ALLOW_PREVIEW=1` ne doit pas être activé en production.

Tests **locaux uniquement** : `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<base PostgreSQL locale de test> npm test` après installation de Chromium Playwright. **22/22 tests réussis** sur la base locale jetable et Chromium simulé. Ne jamais utiliser l'URL de production pour `TEST_DATABASE_URL`. Aucun déploiement du colis 7 ni test authentifié en production n'a été réalisé par l'agent.

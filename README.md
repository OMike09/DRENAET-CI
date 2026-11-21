# DRENAET CI — étapes 1–6

Application web institutionnelle distincte de l'ancien essai APK. Étapes 1–4 : comptes et hiérarchie, instructions, missions, messagerie privée, rapports à circuits configurables, bibliothèque privée et calendrier. **Étape 5 : indicateurs d'activité vérifiables et notifications internes ciblées. Étape 6 : préparation du push web volontaire et générique.** Aucun compte élève ou parent en v1.

**Statut : étape 6 développée et testée localement avec PostgreSQL et Chromium simulé, mais non déployée par l'agent sur Render et non vérifiée sur téléphone réel.** La page publique des étapes 1–3 et `/healthz` répondaient au dernier contrôle ; l'étape 4 n'était pas encore visible dans le dépôt public à ce moment. Aucun accès à Neon, aux comptes privés ni aux sauvegardes de production n'a été effectué. Voir [ETAPE_6_PUSH_WEB_FACULTATIF.md](ETAPE_6_PUSH_WEB_FACULTATIF.md) et le document de l'étape 5.

## Fonctions vérifiées dans les sources

- Comptes nominatifs, sessions HTTP-only, CSRF, affectations et rôle contrôlés côté serveur, suspension, audit. Administrateur général séparé des directeurs régionaux.
- Instructions et missions traçables et alertes internes propres à leurs événements.
- Messages privés entre personnes autorisées et rapports à circuits hiérarchiques configurables, versions et décisions conservées.
- Bibliothèque PDF/PNG/JPEG (2 Mio par fichier, dans PostgreSQL) privée, établissement, région ou générale selon l'autorité de l'auteur ; calendrier à visibilité équivalente, modifications historisées et annulations non destructrices.
- Nouvelle page Statistiques : comptes et établissements actifs, instructions, missions, rapports, documents **accessibles** et événements à venir. Filtres de 30/90/365 jours pour les activités datées ; vue globale pour l'administrateur, vue régionale pour un directeur, vue des éléments accessibles à titre individuel pour les autres. Aucun contenu privé, nom de personne ou résultat d'élève n'est exposé par ces agrégats.
- Rubrique Notifications unifiée : alertes des instructions/missions existantes, ainsi que nouveaux messages, étapes de rapports, publications documentaires et événements d'agenda. Création **dans les mêmes transactions que les opérations réussies**, ciblage par rôle/région/établissement, clé de déduplication par événement, filtre des documents archivés ou devenus inaccessibles. Consultation de la liste **sans marquer Ouvert** ; ouverture du contenu puis confirmation côté serveur. Compteur et états persistants.
- Push web **facultatif** par appareil et session : activation volontaire et révocation dans Mon profil, clés VAPID configurées uniquement en privé, file transactionnelle persistante pour nouvelles alertes, avis génériques sans données sensibles, arrêt à la déconnexion/suspension et après expiration. Nécessite HTTPS et validation réelle sur chaque appareil visé.
- PostgreSQL obligatoire, schéma isolé `drenaet_ci`, migrations versionnées 001 à 006. Les données antérieures restent présentes ; aucune migration d'APK ni effacement automatique.

**Limites :** aucune donnée d'élèves/notes en v1, donc pas d'indicateurs pédagogiques de résultats sans source et définition validées. Le push web n'est ni push natif APK, ni accusé de réception réel ; aucun son système, courriel, rappel automatique, pièce jointe aux messages/rapports ni prévisualisation/antivirus des fichiers. Les notifications d'activité ne sont pas générées rétroactivement pour d'anciens événements ; les anciennes notifications d'instruction/mission sont conservées. Un service gratuit en veille, les autorisations navigateur et l'expiration des sessions limitent la livraison ; pas de test physique ou de garantie sur téléphone.

## Appliquer ce delta après le colis 5

Le colis 6 contient **uniquement les fichiers ajoutés/modifiés par rapport au colis 5**. Il ne fonctionne pas seul. Décompresser, copier en gardant les chemins du dépôt, sans supprimer les autres fichiers et sans téléverser le ZIP lui-même comme code source. Node.js >=20 : `npm install`, `npm start`.

La migration 006 est exécutée automatiquement au démarrage. **Appliquer d'abord le colis 5**,  vérifier l'inventaire, la sauvegarde/restauration et la base ciblée ; ne pas exposer `DATABASE_URL`. La connexion PostgreSQL Render doit rester **directe non poolée**, sans `-pooler` Neon. `BOOTSTRAP_LOGIN` et `BOOTSTRAP_PASSWORD` ne sont utiles qu'au premier compte : ils ne doivent pas être partagés ni ajoutés à GitHub. `PORT` est fourni par Render ; ne pas activer `DRENAET_ALLOW_PREVIEW=1` en production.

Après mise en ligne : logs et `/healthz`, connexion/reconnexion, deux directions distinctes, message/rapport/document/agenda et destinataires d'alertes avec comptes de test autorisés ; vérifier qu'une liste seule ne marque rien « Ouvert ». Configurer VAPID en privé puis vérifier le consentement, le push hors application, la révocation et la suspension sur vrais appareils compatibles ; aucune de ces vérifications distantes n'a été faite par l'agent pour ce colis.

Tests **locaux uniquement**, avec rôle SQL pouvant créer et détruire des bases temporaires :

```text
npm test
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://<base-locale-de-test> npm test
```

Sans URL locale, les tests PostgreSQL/Chromium sont ignorés ; Chromium nécessite `npx playwright install --with-deps chromium`. **Ne jamais** définir `TEST_DATABASE_URL` sur la base de production. Voir les documents ETAPE_1 à ETAPE_5 pour le périmètre des colis précédents.

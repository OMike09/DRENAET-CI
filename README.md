# DRENAET CI — étapes 1–5

Application web institutionnelle distincte de l'ancien essai APK. Étapes 1–4 : comptes et hiérarchie, instructions, missions, messagerie privée, rapports à circuits configurables, bibliothèque privée et calendrier. **Étape 5 : indicateurs d'activité vérifiables et notifications internes ciblées.** Aucun compte élève ou parent en v1.

**Statut : étape 5 testée localement avec PostgreSQL et Chromium, mais non déployée par l'agent sur Render.** La page publique des étapes 1–3 et `/healthz` répondaient au dernier contrôle ; l'étape 4 n'était pas encore visible dans le dépôt public à ce moment. Aucun accès à Neon, aux comptes privés ni aux sauvegardes de production n'a été effectué. Voir [ETAPE_5_STATISTIQUES_NOTIFICATIONS.md](ETAPE_5_STATISTIQUES_NOTIFICATIONS.md).

## Fonctions vérifiées dans les sources

- Comptes nominatifs, sessions HTTP-only, CSRF, affectations et rôle contrôlés côté serveur, suspension, audit. Administrateur général séparé des directeurs régionaux.
- Instructions et missions traçables et alertes internes propres à leurs événements.
- Messages privés entre personnes autorisées et rapports à circuits hiérarchiques configurables, versions et décisions conservées.
- Bibliothèque PDF/PNG/JPEG (2 Mio par fichier, dans PostgreSQL) privée, établissement, région ou générale selon l'autorité de l'auteur ; calendrier à visibilité équivalente, modifications historisées et annulations non destructrices.
- Nouvelle page Statistiques : comptes et établissements actifs, instructions, missions, rapports, documents **accessibles** et événements à venir. Filtres de 30/90/365 jours pour les activités datées ; vue globale pour l'administrateur, vue régionale pour un directeur, vue des éléments accessibles à titre individuel pour les autres. Aucun contenu privé, nom de personne ou résultat d'élève n'est exposé par ces agrégats.
- Rubrique Notifications unifiée : alertes des instructions/missions existantes, ainsi que nouveaux messages, étapes de rapports, publications documentaires et événements d'agenda. Création **dans les mêmes transactions que les opérations réussies**, ciblage par rôle/région/établissement, clé de déduplication par événement, filtre des documents archivés ou devenus inaccessibles. Consultation de la liste **sans marquer Ouvert** ; ouverture du contenu puis confirmation côté serveur. Compteur et états persistants.
- PostgreSQL obligatoire, schéma isolé `drenaet_ci`, migrations versionnées 001 à 005. Les données antérieures restent présentes ; aucune migration d'APK ni effacement automatique.

**Limites :** aucune donnée d'élèves/notes en v1, donc pas d'indicateurs pédagogiques de résultats sans source et définition validées. Aucun push téléphone, son système, courriel, rappel automatique, pièce jointe aux messages/rapports ni prévisualisation/antivirus des fichiers. Les notifications d'activité ne sont pas générées rétroactivement pour d'anciens événements ; les anciennes notifications d'instruction/mission sont conservées. L'étape suivante éventuelle sur le push requiert gestion privée de clés VAPID, consentement, abonnements et essais réels sur plateformes avant toute affirmation de fonctionnement.

## Appliquer ce delta après le colis 4

Le colis 5 contient **uniquement les fichiers ajoutés/modifiés par rapport au colis 4**. Il ne fonctionne pas seul. Décompresser, copier en gardant les chemins du dépôt, sans supprimer les autres fichiers et sans téléverser le ZIP lui-même comme code source. Node.js >=20 : `npm install`, `npm start`.

La migration 005 est exécutée automatiquement au démarrage. **Appliquer d'abord le colis 4**, vérifier l'inventaire, la sauvegarde/restauration et la base ciblée ; ne pas exposer `DATABASE_URL`. La connexion PostgreSQL Render doit rester **directe non poolée**, sans `-pooler` Neon. `BOOTSTRAP_LOGIN` et `BOOTSTRAP_PASSWORD` ne sont utiles qu'au premier compte : ils ne doivent pas être partagés ni ajoutés à GitHub. `PORT` est fourni par Render ; ne pas activer `DRENAET_ALLOW_PREVIEW=1` en production.

Après mise en ligne : logs et `/healthz`, connexion/reconnexion, deux directions distinctes, message/rapport/document/agenda et destinataires d'alertes avec comptes de test autorisés ; vérifier qu'une liste seule ne marque rien « Ouvert ». Aucune de ces vérifications distantes n'a été faite par l'agent pour ce colis.

Tests **locaux uniquement**, avec rôle SQL pouvant créer et détruire des bases temporaires :

```text
npm test
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://<base-locale-de-test> npm test
```

Sans URL locale, les tests PostgreSQL/Chromium sont ignorés ; Chromium nécessite `npx playwright install --with-deps chromium`. **Ne jamais** définir `TEST_DATABASE_URL` sur la base de production. Voir les documents ETAPE_1 à ETAPE_4 pour le périmètre des colis précédents.

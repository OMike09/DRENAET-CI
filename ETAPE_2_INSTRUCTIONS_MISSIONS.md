# DRENAET CI — étape 2 : instructions, missions et alertes internes

**Livraison : code et tests locaux uniquement.** Aucun déploiement, accès à la base Neon/Render ni essai sur téléphone physique n'a été fait. Le service EDUC CI existant reste inchangé.

## Périmètre implémenté

- Une autorité habilitée émet une instruction avec objet, texte, priorité, date limite facultative, et sélectionne un ou plusieurs destinataires directs autorisés. Accusés de réception et de lecture séparés, réponse, éventuelle transmission à un collaborateur autorisé avec instruction liée, décision et historique append-only.
- Une autorité habilitée attribue une mission à un responsable direct et éventuellement des collaborateurs directs, avec échéance et priorité facultatives. Réception et ouverture horodatées séparément pour le responsable, progression 0–100 %, états attribuée / en cours / en attente / soumise / validée / rejetée ; décision par l'émetteur. Les descriptions, réponses et commentaires sont du texte, sans fichiers.
- Cloisonnement sur toutes les routes de lecture et d'écriture, contrôles serveur des destinataires et transitions, journal d'événements immuable et notifications internes ciblées, dédupliquées par événement. L'ouverture d'une notification est enregistrée seulement à l'ouverture du détail ; la simple liste ne marque rien « Ouvert ».
- Interface en français accessible sur ordinateur et largeur mobile simulée : navigation « Instructions », « Missions » et « Alertes internes », composition, lecture détaillée, réponses, décisions, compteurs d'alertes non ouvertes.
- Migrations versionnées dans le schéma PostgreSQL dédié `drenaet_ci`. Aucune table d'autres schémas n'est visée. Les données existantes et APK ne sont pas importés, effacés ou remplacés.

**Pas encore livrés :** pièces jointes, messagerie, rapports autonomes avec circuits configurables, bibliothèque documentaire, calendrier, statistiques métiers, notifications push/système et tests réels sur téléphones. L'interface et l'API de l'étape 1 restent présentes.

## Vérification effectuée

`AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<base PostgreSQL locale de test> npm test` : **7 tests réussis, 0 échoué** (deux scénarios API PostgreSQL sur des bases éphémères, tests d'autorisation et sécurité, deux scénarios Chromium dont un sur viewport mobile simulé). Le navigateur teste la création d'une instruction et d'une mission, ouverture effective d'une alerte, soumission et validation de mission. Redémarrage du serveur simulé dans le test d'intégration ; données conservées sur la base de test. Ceci ne prouve pas la persistance de l'instance distante.

## Préparation d'un déploiement, sans secrets dans l'archive

Ce ZIP **delta** s'applique par-dessus l'étape 1 ; ne pas le charger isolément comme projet complet. Exécuter `npm install`, puis `npm start` sur Node.js >=20 lorsque le service et sa base cible ont été inventoriés et sauvegardés avec restauration testée. Les migrations 001 et 002 sont exécutées au démarrage, sous verrou transactionnel. Ne pas déclencher un démarrage/migration sur une base réelle sans validation du responsable.

La configuration `DATABASE_URL` de ce projet doit pointer sur **une connexion PostgreSQL directe, non poolée**. Le programme rejette une URL Neon `-pooler` **avant toute connexion** : le pool de transaction Neon n'est pas compatible avec le `search_path` de session et les migrations de ce projet. Cette configuration se fait **exclusivement dans les variables privées de Render** ; ne jamais insérer de secret dans un fichier, une archive ou un chat. Le mot de passe Neon communiqué dans la conversation a été exposé : le faire tourner avant toute configuration. Une URL déjà configurée sur Render ne doit pas être révélée ; la vérifier sur place en privé (hôte direct, base et droits) et ne pas la remplacer aveuglément. Ne pas transférer cette application sur le service qui distribue l'ancien APK sans autorisation de bascule.

Avant déploiement : inventaire anonymisé du schéma/base réels, sauvegarde vérifiée et essai de restauration, décision explicite sur un service distinct ou une bascule, tests de reconnexion/redéploiement et contrôle des permissions, puis essais sur appareils si souhaités. Aucune de ces opérations distantes n'a été réalisée ici.

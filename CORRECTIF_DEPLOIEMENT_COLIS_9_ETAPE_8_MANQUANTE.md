# Correctif de démarrage — colis 9 posé sans trois fichiers du colis 8

## Constat vérifié en lecture seule

Le dépôt public `OMike09/DRENAET-CI`, branche `main`, contient `server.js` du colis 9 qui appelle `require('./correspondence-groups')`, mais **pas** `correspondence-groups.js`. Il manque aussi `migrations/008_correspondence_groups.sql` et `web/collaboration-ui.js`. Quatre fichiers de l'application sont encore à la version antérieure au colis 8 : `attachments.js`, `web/app.css`, `web/attachments-ui.js`, `web/coord-ui.js`. Les autres fichiers applicatifs comparés correspondent à la copie locale du colis 9. Cette constatation sur le dépôt public explique le démarrage refusé ; elle **ne prouve pas** l'état privé de la base Neon, ni que Render utilise exactement le dernier commit au moment de la lecture.

Le correctif ZIP fournit ces **sept fichiers d'application** aux chemins exacts, le guide du colis 8 manquant et un test local. Il ne remplace pas tout le dépôt et ne supprime aucun fichier existant. Il préserve donc les fichiers additionnels du dépôt (`Dockerfile`, ancien APK, `render.yaml`).

### Pourquoi la migration 008 est légèrement adaptée dans ce correctif

L'application se connecte et applique les migrations disponibles **avant** de charger `correspondence-groups.js`. Il est donc possible que la migration **009 ait déjà été appliquée** sur la base alors que le fichier 008 manquait sur GitHub. Poser ensuite la migration 008 originale pourrait rétrécir la contrainte des types de notifications et bloquer les rappels du colis 9. **La version de 008 contenue dans ce correctif détecte si 009 est déjà enregistrée et conserve alors ses types de rappels.** Si 009 n'était pas passée, 008 applique sa contrainte normale, puis 009 élargit celle-ci. Aucun effacement d'ancienne ligne ni déclassement de migration n'est prévu.

Deux scénarios ont été exécutés sur PostgreSQL local jetable : **007 → 008 → 009** et **007 → 009 → 008** (avec anciennes alertes conservées et insertion d'un rappel ensuite). La suite locale complète avec le correctif a aussi passé **29/29 tests** lors de la relance finale ; une première relance avait subi une interruption ponctuelle de connexion PostgreSQL dans un test de base jetable, puis le test ciblé et la suite complète ont réussi. Aucun test authentifié n'a été réalisé sur la production.

## Procédure prudente

1. **Ne pas lancer de SQL manuel, ne pas effacer de table et ne pas recopier seulement `server.js`.** Confirmer la sauvegarde de la base et la possibilité de restauration avant de relancer le déploiement. N'envoyer aucun mot de passe, URL Neon ou clé VAPID dans la conversation ou sur GitHub.
2. Décompresser le ZIP correctif et copier **ses fichiers aux mêmes chemins** à la racine du dépôt GitHub `main` ; pour les quatre fichiers existants, remplacer leur contenu par la version du correctif. Conserver tous les autres fichiers. Ne pas déposer le ZIP lui-même comme code source. **Ne pas remplacer ce correctif par l'ancien ZIP du colis 8**, dont la migration 008 ne traite pas le cas 009-déjà-appliquée.
3. Vérifier la présence sur GitHub de `correspondence-groups.js`, `migrations/008_correspondence_groups.sql`, `web/collaboration-ui.js` et des quatre fichiers actualisés. Faire un seul commit, puis demander le déploiement du **dernier commit** sur Render (manuellement si Auto-Deploy est désactivé). Ne modifier aucune variable d'environnement pour cette réparation.
4. Lire les logs jusqu'à « serveur prêt », puis vérifier `/healthz`. Avec des comptes de test autorisés, contrôler Courriers, Groupes, l'ajout/téléchargement privé d'une pièce, et les rappels/exports. Ne pas confondre une page publique qui charge avec un test authentifié des permissions. Si un **nouvel** échec apparaît, communiquer uniquement son message non secret et arrêter les tentatives répétées.

**Contrôle local uniquement :** `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<base PostgreSQL LOCALE de test> npm test`. Ne jamais lancer ces tests destructifs de bases temporaires contre Neon/production.

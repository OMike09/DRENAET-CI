# DRENAET CI — étape 3 : correspondance privée et rapports à circuits hiérarchiques

## Fonctions et règles réellement implémentées

### Messagerie distincte des instructions

- Conversations **1 à 1** entre comptes actifs : supérieur/subordonné direct ou collègues de la même unité et de la même direction régionale. L'administrateur général peut correspondre avec les directeurs régionaux ; un directeur ne contacte pas directement un enseignant en contournant le chef d'établissement. Aucune lecture transversale par un autre compte ni par l'administrateur non participant.
- Texte (4 000 caractères maximum) et historique conservés en PostgreSQL. Le contenu émis ne peut être modifié ou supprimé par l'application ; une ancienne conversation reste consultable par ses participants après changement d'affectation, mais les nouveaux envois sont refusés si la relation n'est plus autorisée.
- « Ouvert » n'est horodaté qu'après affichage du détail d'une conversation, et uniquement pour les messages entrants effectivement chargés à l'écran. La simple liste ne marque rien comme ouvert. Badge interne des messages non ouverts, sans push ni courriel.
- Pas de pièces jointes, groupes, transfert, recherche intégrale ni notification système dans ce lot.

### Rapports textuels à circuits configurables

- L'administrateur général crée des **modèles communs** ou limités à une direction ; les directeurs régionaux créent des modèles de leur direction seulement. On choisit 1 à 3 niveaux ordonnés parmi **chef d'établissement → directeur régional → administrateur général**. Les étapes doivent réellement former une chaîne de supérieurs directs de l'auteur au moment du dépôt ; les combinaisons incompatibles sont refusées, plutôt que routées arbitrairement.
- Un titulaire **actif et unique** doit correspondre à chaque rôle/portée lors du dépôt. Aucun validateur nommé arbitrairement, délégation d'absence ni validateurs parallèles n'est encore géré. Un directeur régional ne s'auto-valide pas ; un enseignant peut, par exemple, suivre chef → directeur → administrateur général si chaque titulaire existe.
- Chaque modèle est immuable dans ses étapes. Pour changer la configuration, en créer un nouveau puis désactiver l'ancien. L'administrateur général peut gérer tout modèle ; un directeur régional seulement les siens dans sa direction. Un modèle désactivé refuse les **nouveaux** rapports sans effacer les rapports antérieurs.
- Rapports textuels (12 000 caractères maximum), objets, versions successives après demande de correction ; toutes les anciennes versions et décisions restent conservées. Chaque validateur n'agit que lorsque sa propre étape est active. Les rapports ne sont visibles que par leur auteur et leurs validateurs désignés (y compris ceux des versions précédentes). Décisions et dépôts audités ; événements et versions protégés par des déclencheurs PostgreSQL contre leur modification/suppression.
- La rubrique Rapports indique les validations à traiter ; pas d'alertes dans la rubrique d'instructions, pas de push ni de pièces jointes. Le futur stockage des fichiers devra rester privé et persistant dans PostgreSQL avec tests d'accès séparés.

## Essais locaux effectués

- PostgreSQL réel, bases temporaires : permissions multi-directions, refus du contournement hiérarchique, confidentialité des messages et rapports, validation dans le bon ordre, demandes de correction et versions immuables, désactivation des modèles, reprise après redémarrage.
- Migration **002 → 003** avec comptes, instruction et mission préexistants : conservation vérifiée localement.
- Chromium : parcours ordinateur et viewport mobile simulé pour messages (lecture réelle et réponse), création de circuit, dépôt et validation d'un rapport. **Aucun téléphone physique et aucun compte ou stockage de production n'ont été testés.**
- `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<PostgreSQL local de test> npm test` : **10 tests réussis, 0 échec** après corrections. `npm audit --omit=dev --audit-level=high` : **0 vulnérabilité signalée** dans les dépendances de production lors de cette vérification.

## Application sans remise à zéro

L'archive du colis 3 est un **delta** du colis 2. Elle ajoute `migrations/003_communication_reports.sql`, `coordination.js`, `web/coord-ui.js`, les tests et met à jour les fichiers nécessaires à l'intégration ; elle **n'inclut pas** le projet complet, `node_modules`, secrets, données Neon ni APK. Décompresser et conserver l'arborescence des fichiers, sans supprimer les autres fichiers du dépôt. La migration transactionnelle est déclenchée au démarrage de l'application : vérifier sauvegarde/restauration et base visée avant toute mise en ligne.

Aucun déploiement de cette étape sur Render, connexion à Neon, sauvegarde distante ou test mobile physique n'a été réalisé par l'agent. Les URL et identifiants privés ne sont ni requis dans l'archive ni à communiquer dans la conversation.

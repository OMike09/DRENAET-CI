# DRENAET CI — étape 5 : statistiques d'activité et notifications internes fiables

## Livré

### Statistiques

- Vue consolidée d'administration générale, vue limitée à une direction régionale pour son directeur, et vue personnelle fondée sur les dossiers réellement accessibles aux autres fonctions. Comptage de comptes/établissements actifs, instructions émises ou reçues, missions, rapports, documents non archivés accessibles et événements du mois à venir. Périodes 30, 90 ou 365 jours pour les activités datées (comptes et établissements actifs non limités par cette période).
- Tableau de répartition par direction pour l'administrateur général : effectifs actifs, missions et rapports, **sans noms, contenus privés ou données d'élèves**. Les chiffres décrivent l'activité enregistrée ; ils ne mesurent ni performances des enseignants ni résultats pédagogiques. Aucun intitulé académique ou donnée scolaire officielle n'a été inventé.

### Notifications dans l'application

- Fusion dans la page Notifications des alertes existantes d'instructions/missions et des alertes ciblées pour nouveaux messages privés, rapports à valider/corriger/approuvés, documents partagés, créations/modifications/annulations d'événements. Aucun contenu sensible (corps des messages, rapports, fichiers) n'est placé dans le titre des alertes.
- Alertes enregistrées dans la transaction du message/rapport/document/événement **réussi** ; échec ou annulation de transaction = aucune alerte. Clé unique par destinataire et événement, pas d'alerte à la simple consultation ou à un nouvel essai d'une opération refusée.
- Portée : message au correspondant, rapport au validateur actif ou à l'auteur selon l'étape, bibliothèque et agenda aux comptes actifs du périmètre publiquement choisi par l'auteur (privé = aucune diffusion). Consultation et téléchargement d'un document archivé ne sont plus offerts aux autres ; les alertes inaccessibles sont filtrées à l'affichage et à l'ouverture. Isolation serveur entre régions et établissements.
- Liste antéchronologique et compteur des non-ouvertes. « Ouvert » est enregistré **après affichage du détail**, après téléchargement réussi d'un document, et, pour un message, seulement si le message ciblé a été marqué ouvert par la consultation effective de la conversation. Une simple liste ne change ni `opened_at` ni `read_at`. Les historiques d'alertes d'instructions/missions sont conservés.
- **Pas de push navigateur/téléphone, vibration, son système ni courriel dans ce lot.** Une alerte interne ne prouve pas qu'un téléphone hors de l'application l'a reçue. Les événements de l'étape 5 ne créent pas rétroactivement des alertes pour tout l'historique des étapes 1–4.

## Validation locale

- Nouvelle migration 005 additive, test 004→005 avec documents, agenda et alertes antérieurs ; redémarrage et persistance testés sur PostgreSQL local.
- Tests API : isolation de deux directions, refus d'ouverture d'une alerte d'autrui, message non marqué ouvert par la seule liste, destinataires successifs de rapport, déduplication, archivage de document, calendrier et aucune alerte de tentative refusée, statistiques différentes selon le périmètre.
- Chromium : écran mobile simulé, navigation de la liste vers message/instruction/calendrier/document et changement de statut vérifié après ouverture réelle, sélection de période statistique. Aucune validation du push ou test sur téléphone physique.
- Résultat final `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<PostgreSQL local de test> npm test` : **16/16 tests réussis** (exécution séquentielle pour éviter les interférences entre bases temporaires et navigateurs). `npm audit --omit=dev --audit-level=high` : **0 vulnérabilité signalée**. Des essais de la suite en parallèle ont rencontré des interruptions intermittentes de connexion pendant la suppression forcée des bases de test ; ces essais ne sont pas présentés comme réussis.

## Livraison et prochaine étape éventuelle

Le ZIP de cette étape est un **delta du colis 4**, non une application autonome ; il n'inclut aucun secret, contenu Neon, APK, fichier de production ni dépendances installées. La migration 005 se lance au démarrage, après les migrations précédentes. La base réelle doit être inventoriée et sauvegardée avec restauration vérifiée avant la mise en ligne, et le colis 4 doit être installé avant le colis 5. L'agent n'a pas déployé ce lot sur Render ni accédé à Neon.

Le souhait de couvrir « tout » ne doit pas conduire à annoncer des fonctions non vérifiées : une étape suivante peut préparer un **push web à consentement explicite** avec clés VAPID configurées en privé et essais réels Android/iPhone. Les indicateurs pédagogiques demandent une définition officielle et une source de données autorisée, sans réintroduire parents/élèves dans la v1 ni publier leurs résultats.

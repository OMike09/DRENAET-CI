# Colis 19 — POINTAGE et suivi hiérarchique des arrivées

## Installation sur l’existant

**Delta à appliquer après le colis 18 installé** (déclaration de l’utilisateur, non vérifiée ici). Ne pas remplacer l’application par une installation vierge, ne pas supprimer les données existantes. Cet agent n’a eu accès ni à Render ni à Neon et n’a rien déployé sur la cible.

1. Vérifier d’abord la présence des migrations 001–018 et des fichiers du colis 18. Sauvegarder le code et la base PostgreSQL, puis tester la restauration sur une instance isolée.
2. Vérifier le manifeste SHA-256, extraire le ZIP à la **racine de la même application**, sans effacer les fichiers préexistants ; installer les dépendances avec `npm ci` sous Node.js ≥ 20.
3. Au démarrage avec la connexion PostgreSQL **directe non poolée**, l’application applique transactionnellement `migrations/019_attendance.sql` une seule fois et enregistre la version 19 dans `schema_migrations`. Cette migration ajoute des tables et l’identifiant de notification `attendance` ; elle ne crée **aucun horaire fictif, aucun pointage, aucune absence**, et ne modifie pas les comptes ou les anciens résultats.
4. Vérifier `/healthz`, les migrations 001–019, les fonctions déjà en place et, avec des comptes réels autorisés en préproduction, les parcours « Pointage » et « Mon pointage ». La réinstallation du code antérieur sur une base ayant reçu de nouvelles écritures ne constitue pas un retour arrière sûr : préserver les nouvelles données et préparer un plan de migration/retour adapté.

## Autorisations et déroulement

- Le directeur régional voit et administre sa région ; le chef son établissement ; l’administration générale la plateforme. Les autres fonctions, **ACE/ACES compris**, n’obtiennent aucun droit de pointage implicite. Une délégation de module ciblée (`view`, `clock`, `configure`, `review`, `correct`, `export`), le droit de consultation correspondant dans la matrice des comptes et un **rattachement nominatif explicite** sont nécessaires pour le personnel subordonné. Le chef ou la direction doit autoriser la délégation ; les actions sont contrôlées côté serveur. Pour utiliser la rubrique hiérarchique, accorder aussi `view`. La délégation `configure` seule ne permet pas de modifier tous les horaires d’un établissement.
- Configurer d’abord des **horaires officiels par jour** au niveau supérieur, puis, dans les limites qu’il fixe, au niveau régional, de l’unité et, selon les droits, du groupe, de la personne ou par exception nominative datée. Un jour fermé par le niveau supérieur ne peut pas être rouvert en dessous. Les règles ont une date d’effet et un auteur ; aucune réécriture rétroactive d’un pointage déjà enregistré. Les seuils initiaux sont : 0 minute = à l’heure, 1–5 léger (jaune), 6–10 sérieux (orange), 11–15 grave (rouge), plus de 15 très grave (rouge foncé). Le supérieur peut fixer des bornes plus strictes ; chaque pointage conserve la version de ses seuils. **Indicateurs, pas sanctions.**
- La saisie initiale est réservée à **la journée courante en `Africa/Abidjan`** ; elle s’effectue par agent, avec des heures différentes dans un même lot. Une heure future est refusée ; une saisie plus de cinq minutes après l’arrivée déclarée demande un motif. Un deuxième pointage le même jour est refusé. L’auteur, l’horodatage et l’historique sont conservés. Une ancienne saisie initiale ne peut pas être fabriquée : seules les corrections motivées d’un **pointage déjà existant** suivent le circuit de demande et validation.
- La personne peut envoyer sa justification, indiquer une arrivée déclarée distincte du pointage et joindre une image ou un PDF facultatif jusqu’à 2 Mio. Le supérieur direct habilité peut accepter, rejeter avec motif, mettre en attente ou demander un complément. Une demande de correction de l’intéressé conserve la valeur initiale et attend une décision motivée ; le supérieur direct peut aussi corriger directement un pointage du jour avec trace. Les documents, les demandes et les décisions sont limités aux personnes habilitées et les événements historiques sont non modifiables.
- Filtres de suivi, synthèses journalières et sur une période de 31 jours au plus ; remontée régionale dédupliquée ; rapports PDF/Excel journaliers, hebdomadaires, mensuels, des retards, justifications, non-enregistrés et individuels. Les exports sont limités au périmètre autorisé et journalisés. Les notifications de pointage vont aux personnes et supérieurs concernés ; la remontée régionale d’événements importants et de corrections reste restreinte. **« Pointage non enregistré » n’est jamais une absence confirmée.**

## Tests locaux, non production

Suite exécutée sur une **base PostgreSQL locale jetable**, avec Chromium desktop/mobile : **47/47 tests réussis**, dont le nouveau test de pointage et les parcours antérieurs. Sont couverts la migration additive, les groupes, les règles par jour et exceptions, les bornes, la confidentialité des pièces, les délégations et rattachements, les décisions, les corrections, les notifications, l’export et le transfert d’établissement sans exposition des anciens dossiers au nouveau chef. Exécution possible dans un environnement local séparé :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

**Ne jamais diriger `TEST_DATABASE_URL` vers Neon ou une base de production.** Cette validation locale ne prouve ni l’installation ni le comportement de la cible Render/Neon.

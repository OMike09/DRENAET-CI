# Colis 18 — Comptes, accès et pouvoirs hiérarchiques

## Installation prudente sur l’application existante

**Delta additif**, à extraire à la racine de DRENAET CI **après les migrations 001–017**. Ne supprimez aucun autre fichier. L’utilisateur n’a pas confirmé l’installation du colis 17 sur la cible ; **l’agent n’a ni accédé à Render/Neon ni déployé ni vérifié la production**. Contrôlez les versions réellement présentes avant toute installation.

1. Sauvegarder la base PostgreSQL et le code, vérifier une restauration isolée, relever les migrations présentes, les données de comptes et les comptes d’administration actifs. Ne jamais lancer les tests PostgreSQL contre Neon ou la production.
2. Appliquer les fichiers du ZIP sur l’application existante, puis `npm ci` sous Node.js ≥ 20. Le démarrage sur une connexion PostgreSQL **directe, non poolée** appliquera de manière transactionnelle `migrations/018_account_governance.sql` si elle n’est pas dans `schema_migrations`. Cette migration ajoute des champs, tables et statuts sans effacer les comptes, anciens hachages, notes, historiques ni anciens mots de passe.
3. Vérifier `/healthz`, `schema_migrations` (001–018), connexion des comptes existants, rôle de chaque responsable et parcours préproduction. Conserver une procédure de retour arrière compatible avec les nouvelles écritures : ne jamais écraser les données récentes en restaurant seulement l’ancien code.

## Codes et mots de passe

- Mot de passe personnel **6 à 128 caractères**, jamais tronqué. Les longs mots de passe existants restent valides ; l’algorithme scrypt avec sel unique continue de vérifier les anciens hachages. Six caractères est un **minimum demandé**, non une recommandation de sécurité : encourager les phrases de passe plus longues.
- Invitations et réinitialisations : code alphanumérique **exactement six caractères**, généré aléatoirement, conservé sous forme d’empreinte sur **un compte précis**, affiché une seule fois au responsable autorisé. En l’absence de durée explicitement choisie, **24 heures** ont été retenues par sécurité. Un code expiré peut être régénéré par un responsable autorisé. Il ne faut jamais le diffuser publiquement.
- Pour une première invitation, l’utilisateur peut se connecter avec son code ou utiliser « Activer un compte avec un code ». Après réinitialisation, l’ancien mot de passe et toutes les sessions sont invalidés ; la connexion avec le code ouvre seulement un parcours temporaire de **changement obligatoire du mot de passe** (15 minutes), jamais les données du compte. Le code est consommé dès cette connexion et le parcours est à usage unique ; à expiration, demander un nouveau code.
- Les tentatives incorrectes sont bornées : **5 échecs par identifiant sur 30 minutes**, ou 25 par empreinte d’adresse sur 30 minutes, bloquent temporairement la connexion. Les personnes dont le compte est désactivé, suspendu, bloqué ou archivé ne se connectent pas. Un administrateur ne peut pas lire les mots de passe actuels. Les opérations de réinitialisation n’exposent pas les anciens secrets.

## Matrice, rattachements et périmètres

- L’**administration générale** configure les permissions par **fonction responsable × fonction dépendante × opération** : consulter, créer, éditer, réinitialiser, activer, désactiver, suspendre, bloquer, débloquer, réactiver, supprimer logiquement, réaffecter, exporter, consulter l’historique. La modification est journalisée ; les rôles égaux ou supérieurs et l’administrateur général ne peuvent pas devenir des dépendants administrables. La matrice ne remplace **pas** les délégations spécifiques des modules pédagogiques, surveillances ou annonces.
- Par défaut, l’administrateur général conserve le périmètre plateforme ; le directeur régional, sa DRENAET (jamais une autre direction) ; le chef, les fonctions subordonnées de son propre établissement. **ACE/ACES, économes et autres responsables : aucun pouvoir sur les comptes par défaut**. Selon la décision de l’utilisateur, il faut leur accorder un droit dans la matrice **et** rattacher chaque personnel **nominativement** depuis l’administration générale. Sans ces deux conditions, aucun accès. Les services peuvent utiliser le rôle additionnel « Personnel de service ». Les nouveaux comptes créés par un responsable explicitement délégué lui sont rattachés nominativement.
- Les routes anciennes `/api/accounts` et `/api/actors` passent désormais elles aussi par les contrôles hiérarchiques pour éviter un contournement de la matrice. Les comptes hors établissement/région, les supérieurs, les pairs non habilités et l’auto-promotion restent interdits côté serveur. La visibilité du menu est un confort supplémentaire, pas une autorisation serveur.

## Dossiers et décisions

- Dossiers : nom/prénoms distincts (sans découpage artificiel des noms historiques), téléphone, courriel, fonction affichée, identifiant professionnel, informations administratives autorisées, rattachement, DRENAET et établissement. La fonction **hiérarchique** et l’unité sont modifiées par l’opération séparée « Changer fonction / unité » avec contrôles ; l’édition du profil ne peut pas modifier le rôle ni attribuer des droits.
- **Désactiver** interdit la connexion ; **suspendre** exige un motif et peut avoir une échéance (sinon jusqu’à décision) ; **bloquer** exige un motif et nécessite ensuite un déblocage puis une réactivation ; **supprimer** exige un motif et archive logiquement le compte. Aucun compte archivé n’est effacé physiquement : les références, anciennes activités, connexions et autres archives demeurent. Une suspension datée expirée est levée à la prochaine tentative de connexion et l’événement est tracé.
- Les actions sensibles demandent une confirmation explicite dans l’interface ; le serveur exige un indicateur de confirmation pour les opérations de gestion. Actions groupées (jusqu’à 50) : activation, suspension, blocage, réactivation, réinitialisation, export filtré ou sélectionné. Les modifications sont transactionnelles : un seul compte hors périmètre annule **tout le lot**. Les codes groupés sont individualisés et affichés une seule fois.
- Audit append-only : auteur, cible, date, origine (empreinte d’adresse et module), motif, avant/après pour les champs modifiés et les états. L’historique récent et les dernières connexions réussies sont réservés à un responsable habilité pour ce dépendant. Aucun mot de passe ni code temporaire n’est écrit dans ce journal.

## Navigation et vérification

Les vrais intitulés accessibles du menu gauche sont triés **automatiquement** avec un comparateur francophone tenant compte des accents ; le logo, l’utilisateur et la déconnexion restent à leurs places. Les droits des fonctions derrière chaque option ne sont pas changés par le tri.

Sur une base locale **jetable** :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

La suite locale a validé la migration, les sept profils demandés, les périmètres multiples, la délégation ACE/économe, l’expiration et la consommation des codes, les mots de passe anciens et nouveaux, l’audit, les statuts, les lots atomiques, le tri/masquage des menus sous Chromium et les parcours antérieurs. **Validation locale uniquement, jamais une preuve de déploiement ou de contrôle de production.**

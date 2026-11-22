# Colis 20 — Supervision régionale du pointage, alertes et convocations

## Installer sans remplacer l’existant

**Delta à appliquer après le colis 19.** L’utilisateur a indiqué que le colis 19 est installé ; cette déclaration n’a **pas** été vérifiée à distance. L’agent n’a pas accédé à Render ou Neon, ni procédé à un déploiement sur la cible.

1. Confirmer sur la cible la présence des migrations **001–019**. Sauvegarder le code et PostgreSQL et tester une restauration isolée. Ne pas effacer les anciennes données ou l’application pour installer ce delta.
2. Vérifier les empreintes du manifeste, déposer les fichiers du ZIP à la racine de l’application existante, installer avec `npm ci` sous Node.js ≥ 20, et redémarrer avec la connexion PostgreSQL **directe, non poolée**. Le démarrage applique transactionnellement `020_regional_attendance.sql` et inscrit la version 20. Vérifier ensuite `/healthz` et `schema_migrations` (001–020).
3. Contrôler en préproduction avec les rôles réels : le Directeur régional ne voit que sa DRENAET ; l’administrateur général voit la synthèse de toutes les DRENAET ; les chefs et autres responsables gardent leurs droits du colis 19 ; l’agent voit uniquement ses propres messages, sauf transmission nominative contrôlée à un responsable habilité. Une restauration du seul code ancien sur une base ayant reçu de nouvelles écritures n’est pas un retour arrière sûr.

## Données et centre régional

- La migration ajoute des champs **facultatifs** « commune » et « téléphone de l’établissement » administrables par la direction compétente ; les valeurs absentes restent « non renseigné ». Une photo PNG/JPEG facultative, jusqu’à 1 Mio, peut être déposée par l’intéressé ou un responsable autorisé. Aucune photo, commune ou numéro n’est inventé. Les photos successives sont conservées, et l’accès est authentifié.
- Le tableau régional calcule à la demande, à partir des horaires et pointages **réellement enregistrés**, les attendus, pointés, à l’heure, retards par niveau, justifiés, non justifiés et non enregistrés. Les listes sont classées très grave → grave → sérieux → léger ; filtres par date, établissement, profession, chef, gravité, justification, traitement et recherche par nom/fonction/téléphone. Vue comparée, barres et classement des établissements : **outil administratif, non sanction**. Les agents sans horaire configuré ne sont pas présentés comme absents. « Pointage non enregistré » ne signifie jamais absence confirmée.
- La direction reçoit une notification **pour chaque retard effectivement enregistré**, de toutes les gravités ; l’alerte régionale est créée dans la même transaction que le pointage, puis recalée après correction sans effacer les événements. La migration reprend dans le panneau **uniquement** les retards déjà présents dans `attendance_records` ; elle ne crée ni pointage ni notification rétroactive. La consultation ouverte actualise les chiffres toutes les **15 secondes** lorsqu’aucun formulaire n’est en cours d’édition ; il ne s’agit pas d’une connexion WebSocket ni d’une preuve de remise hors application.
- Selon le choix de l’utilisateur, l’agent reçoit par défaut une alerte informative dès **tout retard** (dès 1 minute) ; la DRENAET peut versionner à date d’effet son seuil d’alerte à l’agent (1–120 minutes) et sa fréquence de rapport par défaut (quotidien/hebdomadaire/mensuel). Les horaires et seuils de gravité restent régis par les bornes supérieures du colis 19, avec versions et sans requalification rétroactive. Les rapports régionaux PDF/Excel sont générés **à la demande** depuis les données réelles, avec vues journalière, hebdomadaire, mensuelle, établissement, catégorie, retards graves, justifications, dossiers et non-accusés ; la fréquence enregistrée choisit le type proposé par défaut, **sans distribution planifiée**.
- La fiche d’un agent rassemble pointages conservés, retards, justifications et décision du responsable, chef actuel de l’établissement enregistré, téléphone, photo facultative, messages échangés avec le directeur et dossiers régionaux. Si une affectation ou un chef a changé, les coordonnées et le chef actuels ne doivent pas être interprétés comme des photographies de la situation historique ; le pointage lui-même conserve son établissement, sa fonction et ses seuils d’origine.

## Communication, décision humaine et traces

- « Convocations et demandes d’explication » permet les **brouillons** de messages, demandes d’explication/complément, présentation à la Direction et demandes au chef ; l’heure de présentation est saisie en **Africa/Abidjan**. Le texte proposé et les brouillons restent modifiables avant envoi, chaque ancienne version étant conservée dans les événements. Le Directeur régional doit **confirmer séparément l’envoi** et choisir explicitement s’il informe le chef. **Aucun retard n’envoie automatiquement une convocation disciplinaire.** Un pointage réel est exigé pour les demandes liées à un retard.
- Selon la définition choisie par l’utilisateur : « délivré » = mis à disposition dans le compte actif DRENAET CI. Le système garde des preuves distinctes d’envoi, de disponibilité, de consultation de la fiche, de clic explicite « J’ACCUSE RÉCEPTION » et de réponse. Il ne prétend pas prouver une réception SMS, courriel ou hors application. L’agent peut répondre et joindre un PDF ou une image jusqu’à 2 Mio. Les relances ne visent que les dossiers non accusés ; traitement, clôture et transmission nominative à un service compétent sont journalisés.
- Les justifications locales restent **décidées par le supérieur direct habilité** selon le colis 19 ; le directeur régional peut les examiner, demander séparément un complément et transmettre un dossier sans se substituer à cette décision. Les enregistrements, alertes, messages et décisions ont des événements append-only et des entrées d’audit. L’accès aux pièces et aux dossiers est vérifié côté serveur et retiré pour les transmissions en cas de changement de rôle ou d’unité.

## Vérification locale

Sur une base PostgreSQL **jetable**, sans utiliser Neon ou la production :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

La suite valide notamment la migration additive **019 → 020**, les anciens modules, plusieurs établissements et catégories, les cinq niveaux d’arrivée, pluie et justification, correction et mise à jour de l’alerte, alertes à l’agent et au directeur, brouillon puis envoi confirmé, lecture/accusé/réponse/relance, pièces privées, export, changements d’affectation, redémarrage PostgreSQL et écrans mobiles Chromium. Une réussite locale n’est **pas** une vérification de production.

# Rapport de décision — audit rôle par rôle, colis cumulatif 34

## Verdict : **NE PAS DÉPLOYER à ce stade**

J’ai poursuivi moi-même la recette sur le **clone local fictif isolé**, sans intervention sur Render ni réensemencement de la base principale. Dans l’inventaire figé, **0/1 881 boutons** et **0/204 formulaires** restent au statut `NON_TESTE_FONCTIONNELLEMENT` : chaque occurrence a maintenant une qualification documentée. **Cela ne signifie pas 1 881 actions métier validées.** Plusieurs centaines n’ont reçu qu’un contrôle de lecture, d’ouverture, d’onglet ou de formulaire non soumis. Deux formulaires de pointage étaient enregistrés dans le DOM, mais **cachés** dans la vue des directeurs régionaux : ils n’étaient pas cliquables. L’exhaustivité fonctionnelle, les états conditionnels et l’ensemble des permissions serveur **ne sont donc pas démontrés**. Le choix de ne pas déployer est un résultat de la vérification, pas une demande faite à l’utilisateur d’exécuter les essais manquants.

Préproduction dédiée réellement déployable : **non disponible**. Deux bases fictives locales sont utilisées : principale `drenaet_stage_e7526f85`, clone `drenaet_audit_d7d40249`. La version locale est **0.34.0** ; Render avait répondu **0.29.0** au dernier contrôle anonyme, sans session ni écriture authentifiée sur Render. **Aucun déploiement n’a été réalisé.** COGES désigne un dossier de gouvernance, pas un compte autonome. Les essais « mobile » sont des **viewports Chromium**, non des appareils physiques.

## Matrice de l’inventaire initial

Occurrences par compte et état de preuve, **pas taux de réussite métier**. La colonne « formulaire ouvert non soumis » est un sous-ensemble des boutons et ne doit pas être additionnée aux formulaires. Les 18 commandes conditionnelles du registre dynamique ne s’ajoutent pas mécaniquement aux 1 881 lignes : certaines se recouvrent.

| Fonction (compte fictif) | Boutons initiaux | Formulaire ouvert non soumis | Formulaires initiaux | Masqués/non cliquables |
|---|---:|---:|---:|---:|
| Administrateur général | 500 | 170 | 38 | 0 |
| Directeur régional A | 224 | 28 | 20 | 1 |
| Secrétariat régional | 52 | 9 | 6 | 0 |
| Personnel régional | 50 | 7 | 6 | 0 |
| Inspecteur | 53 | 7 | 8 | 0 |
| Chef d’établissement | 201 | 23 | 27 | 0 |
| Adjoint | 57 | 10 | 6 | 0 |
| Coordinateur | 54 | 7 | 6 | 0 |
| ACE/ACES | 85 | 14 | 12 | 0 |
| Économe | 55 | 8 | 6 | 0 |
| Éducateur | 72 | 11 | 12 | 0 |
| Enseignant A | 91 | 10 | 10 | 0 |
| Personnel scolaire | 56 | 9 | 6 | 0 |
| Chef de service | 52 | 7 | 6 | 0 |
| Agent de service | 50 | 7 | 6 | 0 |
| Parent A | 13 | 0 | 1 | 0 |
| Directeur régional B | 130 | 21 | 18 | 1 |
| Enseignant B | 75 | 11 | 9 | 0 |
| Parent B | 11 | 0 | 1 | 0 |
| **Total** | **1881** | **359** | **204** | **2** |

Pour lire la profondeur réelle, voir **les colonnes `statut` et `preuve` de chaque ligne CSV**. Par exemple : **359** boutons ont seulement ouvert un formulaire sans soumission ; **97** ont seulement ouvert une modale ; **366** ont provoqué une lecture sans erreur ; **276** ont changé d’onglet ; **116** ont soumis des filtres, sans audit exhaustif de leurs résultats ; **72** contrôles de pagination sont une fixture DOM temporaire, pas des pages d’enregistrements réels. Les **118** formulaires de filtre suivis n’établissent pas la validité de toutes les mutations. Un bouton avec statut ≠ `NON_TESTE_FONCTIONNELLEMENT` n’est pas automatiquement fonctionnel ou autorisé correctement.

## Scénarios supplémentaires réalisés sur le clone

- **Cahier d’appel :** « Contrôler les appels manquants » échouait réellement avant toute requête à cause de `to is not defined`. Variable `to` définie dans `web/roll-calls-ui.js` ; **3/3 rôles** (chef, éducateur, enseignant) ouvrent maintenant la fenêtre après HTTP 200. Régression Chromium ajoutée à `tests/roll-calls-postgres.test.js`. Parent refusé **403** et enseignant d’autre région sur la classe A **404** côté serveur. Une fenêtre vide ne prouve pas l’existence d’appels manquants.
- **Parents :** 15/15 révocations par l’interface suivies de réapprobations SQL des trois liens ; cinq invitations fictives via l’interface, liens proposés et comptes ensuite archivés. Le bouton « Retour aux parents », sans rafraîchissement auparavant, a été réparé dans `web/family-governance-ui.js` et testé en Chromium. Aucun compte ni mot de passe réel modifié.
- **Années et courrier :** quatre années fictives hiérarchisées créées sur le clone ; circuit courrier fictif **ID 4**, courrier **ID 1** vérifié en brouillon SQL. Ni publication ni envoi de courrier réel. Trois destinations de pointage régional vérifiées.
- **Inspection et délégations :** deux attributions régionales fictives créées/révoquées, une attribution existante révoquée puis rétablie ; une attribution région B créée/révoquée après prérequis fictifs. Délégation ACE révoquée puis restaurée avec ses droits initiaux ; formulaire UI POST 201 et SQL. Deux comptes auxiliaires créés pour le contexte région B ont été **archivés** après la recette.
- **Surveillance :** délégation de supervision basculée puis restaurée ; règle temporaire enregistrée puis état initial sans ligne restauré. Deux demandes fictives d’indisponibilité transmises, **en attente**, et vérifiées en SQL ; aucune validation automatique. Deux boutons de relance retournent HTTP 200 avec **`notified: 0`** faute d’affectation validée dans ce clone : l’envoi, la réception et l’accusé n’ont **pas** été prouvés.
- **Emploi du temps :** les deux formulaires « Générer » avaient d’abord répondu 200 avec garde `settings_missing`. Les prérequis fictifs ont été ajoutés selon la hiérarchie (paramètres, volume de cours, profil de classe, salle), puis chef et ACE ont généré chacun **deux séances en brouillon** (versions 2 et 3, SQL). **Aucune publication**. Génération par enseignant refusée **403**.
- **Pointage :** règle plateforme fictive datée du jour de l’horloge du clone ; chef a saisi une arrivée fictive **08:12**, réponse UI **201** et enregistrement SQL `arrival_min=492` pour compte fictif ACE. Le directeur régional A et celui de B affichent leur tableau régional ; le formulaire générique `att:clock` y est **caché**. Tentative directe de pointage hors périmètre refusée **403** ; cela ne valide pas la saisie de chaque rôle ni les corrections. Cette fixture est sur le clone seulement.
- **Autres vérifications antérieures sur clone :** **181/181** ouvertures de composition après prérequis région B, **92/92** catalogues, **90/90** identité ; 100 déplacements de menu réversibles, 57 bascules de visibilité, 19 rotations de secrets fictifs restaurés, 12 exports PDF/XLSX supplémentaires, 37 notifications ouvertes avec date SQL, 11 suppressions gardées, 13 références créées/désactivées, 20 transitions groupées et contrôle de refus, 17 préférences de rappels restaurées SQL et 2 filtres régionaux soumis. Les vérifications antérieures (messages parent–éducateur, dossiers COGES/examen fictifs, permissions ciblées, statistiques) sont consignées dans `AUDIT_34_CONTROLE_BOUTONS_EN_COURS.md`.

**Contrôles négatifs ciblés nouveaux : 6/6 refus serveur** sur lecture d’appels par parent et autre région, génération par enseignant, relance par enseignant, attribution inspecteur hors région et pointage hors périmètre (`staging/audit-final-permissions.json`). Cela ne représente **pas toutes les routes/permissions**.

## Régression et limites qui empêchent le feu vert

Suite complète **PostgreSQL jetable + Chromium : 63/63 réussis, zéro ignoré, zéro échec** après les deux corrections UI et l’ajout de la régression des appels manquants (`staging/audit-roles-34-full-latest.log`). `staging/verify.js` a aussi contrôlé 19 authentifications et des refus ciblés. Le droit SQL temporaire `CREATEDB` a été retiré après les tests (`NOCREATEDB` vérifié). Des échecs intermédiaires de harnais ont été conservés comme tels ; ils ne sont pas des succès produits requalifiés.

**Limites irréductibles de ce passage :** 359 ouvertures de formulaire **sans soumission** ; nombreux états produits après mutation non recensés ; réceptions de notifications et relances à zéro destinataire non démontrées ; pagination des vrais historiques à une page non démontrée ; vérifications d’autorisation seulement échantillonnées, non exhaustive route × rôle × ressource ; jeux de données fictifs insuffisants pour tous les cas d’erreur et de concurrence ; Firefox, WebKit/Safari et appareils physiques non testés ; aucune installation sur une préproduction dédiée avec sauvegarde et URL séparée. La date locale demandée est **14 octobre 2026**, mais l’horloge des journaux du bac à sable produit **28 novembre 2026** : les scénarios dépendant de « aujourd’hui » (pointage, calendrier, génération) ont été exercés **selon l’horloge du clone**, et ne valent pas validation calendaire sur une instance correctement synchronisée.

**Prochaine décision :** conserver le colis préparé **hors déploiement**. La passe des contrôles initialement sans statut est terminée, mais la demande de validation exhaustive des mutations et droits n’est **pas** atteinte. Le dossier permet de cibler précisément les preuves insuffisantes ; il ne donne pas un feu vert et ne doit pas être décrit comme « tous les boutons fonctionnent ».

## Pièces remises

`AUDIT_BOUTONS_SUIVI.csv`, `AUDIT_FORMULAIRES_SUIVI.csv`, `AUDIT_BOUTONS_DYNAMIQUES.csv`, `AUDIT_34_CONTROLE_BOUTONS_EN_COURS.md`, `COLIS_34_NOTICE.md`, `COLIS_34_MANIFESTE_SHA256.txt` et `DRENAET-CI-colis-34-audit-roles-cumulatif.zip`. Les logs bruts, la configuration secrète, les identifiants et les sauvegardes restent dans `staging/`, **hors ZIP**. Le delta s’applique après le colis 29 uniquement sur copie autorisée ; il n’est pas une installation autonome.

# DRENAET CI — colis 9 : rappels et exports privés

## Rappels : fonctionnement exact

Les rappels concernent **les instructions reçues non exécutées/validées**, **les missions confiées non validées** et **les événements de calendrier encore actifs que le compte peut voir**. Chaque compte peut les activer/désactiver dans **Mon profil** et choisir une avance de **1, 6, 24 ou 48 heures** ; par défaut, ils sont actifs à 24 heures. Le traitement automatique balaie les comptes actifs par petits lots environ toutes les 90 secondes **quand le processus Node fonctionne** ; consulter Notifications déclenche aussi un rattrapage pour le compte connecté. Les échéances de dossiers de travail dépassées depuis moins de 7 jours peuvent être rattrapées ; les événements déjà passés ne produisent pas de nouveau rappel. Les rappels ont des titres génériques, sans objet ni contenu de dossier, et sont dédupliqués en base par compte, type, dossier et date d’échéance. Une échéance réellement déplacée peut donner un nouveau rappel.

Les alertes internes restent privées et le lien exige encore les droits actuels sur le dossier. Si le compte change de DRENAET ou si un groupe de messagerie n'est plus accessible, l'accès n'est pas recréé par le rappel. Si le **push web facultatif** du colis 6 est déjà activé par la personne sur son appareil, la même file de push reçoit un avis générique, sans texte du dossier. Les droits sont revérifiés avant expédition. Sans consentement push, il n'y a **aucune** alerte hors application ; il n'y a ni SMS, ni e-mail, ni garantie de réception sur téléphone. **Un hébergement gratuit en veille ne garantit pas l'heure d'envoi : le traitement reprend au réveil, et les avis push peuvent ne plus être pertinents si la session a expiré.** La migration ne crée pas rétroactivement d'alertes : les rappels sont produits après activation du nouveau code, uniquement pour les fenêtres décrites ci-dessus.

## Exports : formats et droits

Nouvelle rubrique **Exports**, accessible à chaque compte connecté. Choisir : statistiques (30/90/365 jours), instructions, missions, rapports, courriers ou calendrier. Télécharger en **CSV UTF-8**, **PDF** ou **classeur Excel `.xlsx`**. La requête vérifie les droits **à chaque téléchargement**, avec les mêmes restrictions de participants et de région/établissement que les modules ; l'administration générale n'obtient pas par défaut le contenu d'un dossier privé auquel elle ne participe pas. La vue Statistiques reprend les agrégats existants et son périmètre (global pour l'administration générale, régional pour la direction régionale, personnel pour les autres). Les listes exportées se limitent aux **1 000 entrées les plus récentes**, ou **200 pour le PDF** ; ce n'est pas une extraction exhaustive. Les colonnes sont des métadonnées (objet, état, dates, acteurs autorisés), **pas** les corps des messages, descriptions détaillées, fichiers joints, données d'élèves ou secrets. Les téléchargements sont journalisés dans l'audit (type, format, nombre de lignes, sans contenu du fichier). Le CSV neutralise les débuts de formule ; le XLSX ne crée aucune formule ni lien externe. Protéger les fichiers après téléchargement et décider de leur conservation selon la politique institutionnelle.

## Déploiement prudent — delta après les colis 7 et 8

1. Vérifier sur le dépôt **et sur la base** que les migrations **001–008** et les fichiers des colis 1–8 sont effectivement présents. **Ne pas supposer** que les colis 7 ou 8 sont déjà sur Render. Sauvegarder la base et vérifier une restauration avant tout déploiement ; ne pas utiliser les tests jetables sur la production.
2. Copier uniquement les fichiers du ZIP du colis 9 aux mêmes chemins, **sans effacer les autres fichiers**. Le delta ne fonctionne pas seul. Node.js 20 ou supérieur ; `npm ci` installe les bibliothèques requises pour PDF et Excel depuis le verrou de dépendances. Utiliser une connexion PostgreSQL **directe, non poolée**. Garder `DATABASE_URL`, mots de passe, clés VAPID et autres secrets hors de GitHub et de ce ZIP.
3. Avec accord opérationnel, redémarrer/redéployer le Web Service. La migration additive `009_reminders_exports.sql` est transactionnelle et automatique au démarrage : préférences et journal de déduplication nouveaux, nouveaux types d'alertes, sans suppression d'anciennes données. Vérifier les logs et `/healthz`. Ne pas forcer manuellement la migration si elle échoue. Le traitement automatique démarre dans le serveur Node ; en cas de plusieurs instances, la contrainte d'unicité PostgreSQL empêche les doublons de rappels.
4. Après déploiement autorisé, vérifier avec des comptes d'essai : préférence individuelle, rappel à l'approche de l'échéance et absence de doublon au retour sur la page, état des rappels d'un dossier validé/annulé, trois formats d'export, refus d'accès après réaffectation, et séparation de deux DRENAET. Contrôler un vrai téléphone et l'état du service de push **si** ces fonctionnalités sont attendues ; les tests locaux ne les prouvent pas.

## Validation locale et limites de preuve

Sur une base PostgreSQL locale **jetable** avec droit de créer/supprimer ses bases temporaires :

```text
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://<URL-LOCALE-DE-TEST> npm test
npm audit --omit=dev --audit-level=high
```

**28/28 tests réussis, aucun ignoré** sur PostgreSQL local et Chromium mobile simulé : migration 008→009 conservant courriers et groupes, déduplication et préférences, séparation des régions, audit, redémarrage, CSV sûr, PDF et XLSX téléchargés. Le classeur XLSX a aussi été ouvert localement avec `openpyxl`. Audit des dépendances de production : **0 vulnérabilité signalée** au contrôle local ; recontrôler lors d'une installation ultérieure. Le processus automatique a été déclenché en test sans attendre 90 secondes ; **aucun service Render en veille, aucune réception push sur téléphone physique, aucun déploiement GitHub/Render/Neon et aucun compte de production** n'ont été vérifiés par l'agent pour ce colis.

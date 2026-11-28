# Audit 29 — annonces officielles, boutons et déploiement

**Périmètre réel de l'audit :** priorité au module « Annonces officielles » indiqué par l'utilisateur, à son câblage d'actions et aux chemins de publication, d'images et de style ; vérification statique du répartiteur d'actions de l'interface. La suite de régression couvre l'application, mais **ceci n'est pas une certification que chaque bouton de chaque module de l'application fonctionne dans tous les états métier**. Aucun accès à Render/Neon ni test sur la production : état du service et version réellement déployée inconnus.

## Constat après lecture du projet

- Les versions précédentes ont passé des tests locaux, mais les logs fournis précédemment montraient un **refus de connexion PostgreSQL pour quota dépassé** suivi de la suspension du service. Si ce refus persiste, **aucun bouton ne peut fonctionner en production**, quelle que soit la qualité du delta. L'utilisateur n'a pas encore confirmé que le quota est rétabli ou que le colis 28 est bien déployé.
- Les fichiers du colis 28 sont présents et cohérents dans le workspace et son ZIP ; cela **ne prouve pas qu'ils sont en place dans Render**. Le delta 28 s'applique après 27 et ne constituait pas la refonte exhaustive demandée.
- Le serveur envoie `Cache-Control: no-store` et le service worker actuel ne met pas les pages en cache. Une ancienne version chargée sur le serveur, une migration non appliquée ou un service suspendu sont à distinguer d'un cache navigateur supposé.
- Dans le module d'annonces, les 16 familles de boutons déclarées dans le code ont une branche d'action correspondante. Leur présence dans le code seule ne prouve pas tous les parcours ; les parcours détaillés ci-dessous ont été exécutés sur une base jetable.

## Défauts réellement reproduits et corrigés dans ce delta

1. **Flèches de réorganisation des images :** le client envoyait `ordre ± 1`. Si deux images avaient des ordres consécutifs, cela créait un ex æquo ; le tri par identifiant conservait l'ordre apparent, donc le bouton semblait inactif. Le serveur réordonne maintenant atomiquement les images d'un brouillon sous verrou, avec positions distinctes, auteur contrôlé et événement d'audit. Montée et descente vérifiées dans PostgreSQL ; montée vérifiée sur téléphone, puis après actualisation.
2. **Dates affichées lors de la modification :** un horaire enregistré en UTC était recopié tel quel dans un champ `datetime-local`. En fuseau Paris, un horaire enregistré à 13 h UTC était présenté à tort comme 13 h local, et sa réédition pouvait décaler l'annonce. Le formulaire convertit maintenant vers l'heure locale du navigateur ; test automatisé en fuseau Europe/Paris (13 h UTC → 15 h local le 10 mai 2027).
3. **Sélection de pièces d'une demande :** le formulaire permettait visuellement plusieurs fichiers alors que le serveur/client n'en acceptent qu'un pour une demande. Le champ multiple n'est proposé que pour les annonces.
4. **Téléchargement :** le navigateur utilisait un nom générique `piece-ID` malgré un nom de fichier disponible. Il reprend le nom du dossier visible, sinon le nom de repli.
5. **Faux succès silencieux :** une action de communication inconnue ne produit plus un simple non-événement ; un formulaire inconnu ne peut plus aboutir au message « Enregistré ». Une erreur explicite s'affiche à la place.
6. **Visibilité du déploiement :** le log `npm start` annonce désormais `DRENAET CI — lancement version 0.29.0` **avant** la tentative de connexion DB. Quand le serveur démarre, `/healthz` répond `{"status":"ok","version":"0.29.0"}` sans solliciter PostgreSQL. Cela permet de distinguer code déployé, ancienne version et panne de démarrage. `/healthz` ne peut pas répondre si le processus est suspendu ; il ne répare ni quota ni migration.

## Régressions exécutées

- PostgreSQL local jetable et Chromium, téléphone : nouveau brouillon, publication, sélection de destinataires, pièces PNG multiples, ordre, masquage, lecture après actualisation, consultation/accusé, style d'administration et affichage du style à un destinataire, isolement hors périmètre, dates localisées.
- Suite complète locale : **61 tests réussis sur 61**, aucun échec dans `/home/user/drenaet-audit29-61-delivery.log`. Vérification de syntaxe `node --check` sur les fichiers modifiés. Aucun navigateur ou base de production n'a été utilisé.

## Déploiement sûr et diagnostic demandé à l'utilisateur

Ce delta de quelques fichiers **s'applique après le colis 28**. Il n'ajoute aucune migration ni suppression de données ; conserver la base, les identifiants et les fichiers précédents. Sauvegarder le projet avant remplacement. Le colis 28 contenait la migration 026 ; s'assurer que l'application cible dispose bien des colis 26, 27, 28 avant 29. Ne pas répéter les déploiements si le fournisseur PostgreSQL refuse toujours les connexions.

1. Dans la console PostgreSQL (probablement Neon), vérifier **Usage/Billing** : limite exacte, date de renouvellement, état du projet. Ne partager ni `DATABASE_URL` ni mot de passe.
2. Si la DB accepte de nouveau les connexions, relancer Render une seule fois. Lire le début des logs : `lancement version 0.29.0` prouve que le nouveau `server.js` est chargé ; `Démarrage refusé` suivi d'une erreur de quota prouve que l'hébergement reste bloqué.
3. Si le service répond, ouvrir `https://VOTRE-SERVICE/healthz` (sans communiquer de secrets). Attendu : `version: 0.29.0`. Si le site est accessible mais renvoie une autre version, vérifier quel dépôt/commit ou ZIP Render a réellement déployé.
4. Après confirmation de la version 0.29.0, reproduire un bouton en indiquant : rôle utilisé, page, bouton exact, résultat attendu, résultat obtenu et statut HTTP de la requête dans l'onglet Réseau du navigateur **sans cookies, jetons ou données privées**. Ce sera un défaut de fonctionnement à corriger, distinct d'un service suspendu.

## Limites restantes (pas de fausse promesse)

- Pas d'accès Render ou Neon ; aucune preuve que les corrections récentes ont été installées ni que le quota est redevenu disponible.
- Les sept styles d'annonces du colis 28 sont des variantes partielles, non une refonte visuelle exhaustive. Éditeur enrichi, prévisualisation PDF intégrée, archivage/pagination serveur et catalogue officiel exhaustif des matières ne sont pas terminés.
- Les autres modules ont des tests de régression, **pas** un parcours automatique de tous leurs boutons et de tous leurs rôles. Pour auditer des boutons hors annonces, transmettre quelques exemples prioritaires et les logs/statuts des requêtes correspondantes ; ne pas les déclarer réparés sans reproduction.

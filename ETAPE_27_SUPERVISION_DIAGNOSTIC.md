# Colis 27 — delta essentiel : supervision régionale et disponibilité

Ce delta s'applique **par-dessus le projet déjà mis à jour avec le colis 26**. Il ne contient pas d'application complète et ne supprime ni compte, ni table, ni fichier, ni historique. Faire une sauvegarde de la base et du projet, restaurer la sauvegarde en préproduction, puis tester avant une mise en production. Aucune installation sur Render ou Neon n'a été réalisée ici.

## Incident 504 : diagnostic déterminant

Les logs de déploiement transmis indiquent « Démarrage refusé : Your account or project has exceeded the quota. Upgrade your plan to increase limits », suivi d'une sortie avec code 1. La connexion PostgreSQL est refusée **avant le démarrage du serveur** ; Render suspend ensuite le service après des échecs répétés. Le 504 est une conséquence du service indisponible. Le fournisseur et la métrique épuisée doivent être vérifiés dans la console de la base (probablement Neon, Usage/Billing). L'option automatique de déploiement ou d'autoscaling ne relève pas les plafonds d'un plan. Aucun ZIP, réglage de route ou nouveau déploiement ne rétablit un quota épuisé.

**Avant de déployer ce delta :** consulter Usage/Billing chez le fournisseur PostgreSQL, relever la limite effectivement atteinte et la date de renouvellement ; attendre ce renouvellement ou choisir explicitement un plan/quota plus élevé. Ne pas transmettre de mot de passe, de jeton ni l'URL complète de la base. Ne pas supprimer/recréer la base pour contourner le plafond. Après rétablissement de l'accès PostgreSQL, reprendre Render une seule fois, puis contrôler les nouveaux logs. Une réduction du trafic applicatif peut aider à l'avenir, mais ne supprime pas la consommation déjà comptabilisée ; ce colis ne modifie pas les cadences métier des rappels, push et courriers.

## Modifications limitées

- `/healthz` répond à une sonde de vie **sans requête SQL**, une fois le serveur démarré. `/readyz` vérifie PostgreSQL et renvoie HTTP 503 si la connexion échoue. Ne pas utiliser `/readyz` comme sonde fréquente si l'objectif est de laisser la base s'endormir. **Si la base refuse le démarrage, aucun de ces deux endpoints n'est accessible** : ils ne règlent pas le 504 d'un quota épuisé.
- L'organigramme montre un lien **visuel** de « supervision régionale générale » depuis l'unique directeur régional actif vers certains responsables régionaux et chefs d'établissement sans rattachement administratif déclaré. Le lien est calculé à la lecture, n'est pas écrit en base, ne crée aucune délégation et ne figure pas dans les contrôles d'autorisation. Les liens administratifs nominatifs existants gardent la priorité. L'Inspecteur général n'est pas automatiquement placé sous le DRENAET.
- La page distingue explicitement ces liens visuels des liens administratifs, pédagogiques et fonctionnels. Les postes et structures officiels restent à paramétrer manuellement selon les éléments vérifiés par l'administration régionale.

## Application et vérifications

Remplacer uniquement les fichiers du delta, conserver les autres fichiers du projet et la base PostgreSQL. Installer les dépendances selon le déploiement habituel (`npm ci` si nécessaire), conserver les variables d'environnement existantes. Ne pas renommer de tables, routes API ou codes de rôle. Test local avec base de test et navigateur : `TEST_DATABASE_URL=... AC_RUN_BROWSER_TESTS=1 npm test`. Le test hiérarchique couvre le lien visuel, l'absence d'Inspecteur général, l'absence de doublon et les sondes HTTP. Les tests restent locaux et ne démontrent pas la disponibilité de l'hébergement réel.

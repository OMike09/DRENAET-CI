# Colis 23 — Couverture et identité DRENAET CI – MENAET CI

## Application du delta

**À appliquer après le colis 22 sur le projet existant, sans effacer les autres fichiers.** Le colis 22 a été remis, mais son installation sur la cible n’a pas été vérifiée ici. Sauvegarder le code et PostgreSQL avant déploiement, vérifier le manifeste SHA-256, copier les fichiers à la racine du projet, lancer `npm ci` sous Node ≥ 20, redémarrer en préproduction, puis contrôler `/healthz` et les parcours réels. **Aucune migration, modification de schéma, suppression de donnée, de compte ou de fonctionnalité ; aucun changement des identifiants techniques ni des routes API.** La nouvelle page 404 concerne uniquement les URL de pages non-API inexistantes. Aucun accès à Render/Neon ni vérification en production.

## Couverture authentique

La photo originale du siège fournie précédemment demeure **inchangée** (`web/ministere-couverture-defaut.webp`, 2048 × 768). `web/ministere-couverture-mobile.webp` est un **recadrage photographique de cette même image**, sans génération par IA et sans bâtiment fictif : la version étroite montre le bâtiment plutôt qu’un morceau de l’inscription imprimée à gauche. Cette source mobile n’est utilisée **que si la couverture générale par défaut est active** ; un administrateur qui a téléversé sa propre couverture conserve son image et le même traitement responsive.

La couverture de connexion est bord à bord sur toute la largeur de son panneau. Celle du tableau de bord remplit toute la largeur disponible de son contenu. Le conteneur et l’image commencent au même bord ; `object-fit: cover` préserve les proportions et supprime les bandes vides créées par `contain`. Le cadrage desktop conserve l’inscription de la photo ; le cadrage mobile se concentre sur la tour. Angles, ombre légère et dégradé bas améliorent le contraste sans masquer la photo. La présentation a été contrôlée à **1440, 768 et 390 pixels** de largeur. Les couleurs et visuels personnalisés existants restent en place.

## Noms et surfaces visibles

- **DRENAET CI** : plateforme ; **MENAET CI** : institution de tutelle. Quand les deux sont présentés ensemble, la signature est « DRENAET CI – MENAET CI ». La hiérarchie figure dans la connexion/activation, la navigation latérale/mobile, le tableau de bord, les titres d’onglet, le chargement et la page 404.
- Manifeste PWA servi dynamiquement et fichier statique harmonisés : nom complet combiné, nom court `DRENAET CI` (adapté aux lanceurs), icônes D préexistantes conservées et toujours personnalisables par l’administrateur. Les icônes et logos ne sont **pas** présentés comme des logos ministériels officiels.
- En-têtes et métadonnées des PDF communs, courriers et attestations affichent la signature combinée. Les titres des exports conservent leur objet sans redoubler le nom de plateforme ; les notifications techniques ne changent pas de destinataire et conservent le titre court `DRENAET CI`. Le libellé de l’image source visible sur la photo n’est pas réécrit : elle reste authentique.
- Il n’y a pas d’inscription publique : le parcours d’activation avec code existant est conservé et habillé de la même identité. Les journaux et notices historiques restent intacts ; aucune donnée de dossier n’est renommée.

## Vérifications locales

Commande sur une base PostgreSQL **jetable**, jamais sur Neon :

```bash
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

Le nouveau `tests/identity23-browser.test.js` vérifie : égalité SHA-256 entre l’original servi et le fichier d’origine, géométrie bord à bord/image chargée sans étirement à trois tailles, recadrage mobile, connexion et navigation mobile, nom d’onglet, PWA, chargement et erreur 404, en-tête PDF, absence d’anciens noms recherchés dans les textes des pages, navigation complète des rôles administrateur général, directeur régional, chef d’établissement et enseignant, ainsi que connexion/écrans représentatifs des onze autres fonctions. La suite historique recontrôle les accès, menus, données, imports/exports et PDF. **Résultat de la suite complète : 54 tests sur 54 réussis localement.** À refaire sur l’environnement cible avec ses configurations et personnalisations réelles avant de déclarer le déploiement validé.

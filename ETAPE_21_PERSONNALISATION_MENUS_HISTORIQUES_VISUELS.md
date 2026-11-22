# Colis 21 — Personnalisation des menus, historiques et visuels

## Installation prudente sur l’application existante

**Delta à appliquer après le colis 20.** L’utilisateur a déclaré le colis 20 installé sur la cible ; l’agent n’a pas vérifié Render, Neon ni l’application de production. Avant installation, vérifier les migrations **001–020** sur la base cible ; sauvegarder code et PostgreSQL et tester une restauration isolée. Vérifier les SHA-256 du manifeste, copier les fichiers du ZIP à la racine du projet **sans effacer les autres fichiers**, exécuter `npm ci` sous Node.js ≥ 20, puis redémarrer avec une connexion PostgreSQL **directe, non poolée**. Le démarrage applique transactionnellement `021_visual_customization.sql` et inscrit la version 21. Vérifier `/healthz`, `schema_migrations` (001–021), les connexions des différents profils et les écrans ci-dessous en préproduction. Une ancienne version de code seule n’est pas un retour arrière sûr après de nouvelles écritures.

## Couverture fournie, profil et identité visuelle

- L’image transmise par l’utilisateur « Ministère ivoirien de l’Éducation Nationale.png » a été **convertie en WebP de 397 054 octets, 2048 × 768** pour constituer la couverture générale **par défaut** (`web/ministere-couverture-defaut.webp`). L’image originale fournie ne devient **pas** un logo officiel. Aucun logo officiel n’a été fourni ni inventé.
- L’administrateur général trouve « Identité visuelle de la plateforme » dans le menu. Il peut importer, prévisualiser, recadrer, remplacer ou restaurer au défaut la couverture générale, les logos principal/compact/connexion et les icônes PWA 192/512. Les icônes PWA nécessitent le PNG à la taille exacte après recadrage. Les fichiers de la plateforme sont distincts des photos de personnel. Le manifeste et les icônes servent la révision en base ; le logo de remplacement ne modifie pas les accès.
- « Mon profil » donne au propriétaire l’ajout/modification/suppression de sa photo JPG/JPEG, PNG ou WebP et d’une **couverture personnelle distincte** de la couverture générale. Un responsable ne peut corriger les images d’un compte que s’il possède déjà la permission technique `edit` pour cette personne, avec vérification serveur de son périmètre et de son rattachement. L’avatar et la couverture du profil ont chacun un défaut indépendant. Les photos antérieures du pointage (colis 20) restent conservées et deviennent visibles dans Mon profil sans écrasement ; les nouveaux dépôts faits depuis l’ancien formulaire de pointage synchronisent le pointeur du profil.
- Le recadrage, le zoom et le décalage sont visibles avant validation ; le navigateur génère une image compressée (WebP, PNG pour PWA) et élimine les métadonnées du fichier initial. Les dimensions, signature, format et tailles sont aussi contrôlés côté serveur : **avatar 1 Mio**, logos **2 Mio**, couvertures **4 Mio** (limite de données binaires). Les fichiers privés ne sont pas publics ; les images, pointeurs et versions archivées restent dans PostgreSQL après redéploiement. Les photos privées ont `no-store`, les visuels publics actualisent leur cache avec la révision. L’ancienne version du fichier reste archivée, mais la restauration proposée par l’interface remet le **défaut**, non une version d’image précédente.

## Personnalisation et historique des menus

- « Personnalisation du tableau de bord », **administrateur général uniquement**, configure **chaque profil séparément** : ordre des catégories/options, déplacement par boutons haut/bas ou glisser-déposer souris/tactile, catégorie vide à créer/renommer/masquer/supprimer, déplacement d’une option dans une catégorie, libellé, icône, visibilité, aperçu avant publication, enregistrement, annulation du brouillon, retour à la version immédiatement précédente et remise au défaut alphabétique. Une catégorie ne peut être supprimée tant qu’elle contient une option ; une option technique ne peut être supprimée, dupliquée ni ajoutée sous un identifiant inventé.
- Chaque enregistrement est append-only, en PostgreSQL, avec auteur, profil, révision et pointeur de version précédente ; une collision concurrente exige de recharger. **Masquer un menu n’est qu’une décision de navigation** : ni les permissions serveur ni les API et liens directs déjà autorisés ne changent. Le navigateur continue de filtrer les fonctionnalités par rôle et capacité existants ; les deux contrôles d’administration restent accessibles à l’administrateur général pour récupérer une configuration masquée. La prévisualisation du brouillon ne publie aucune modification.

## Historiques sans changement des droits

- Les notifications **non lues** restent visibles sur leur page ; les notifications **lues** passent sous « VOIR LES HISTORIQUES ». Les arrivées déjà enregistrées dans « Mon pointage » et les anciennes versions de l’emploi du temps sur la page du gestionnaire passent aussi derrière ce volet, fermé par défaut. L’ouverture propose recherche textuelle/état/date et pagination 10/25/50 des éléments **déjà chargés et déjà autorisés**, tout en conservant les boutons de détail, les filtres de période du module, les exports PDF/XLSX déjà permis et toutes les API/permissions originales. Une recherche côté navigateur porte sur les résultats reçus, **pas** sur l’intégralité de la base au-delà des limites serveur du module ; elle ne constitue pas un nouveau journal transversal. Les historiques du détail d’un dossier restent accessibles à l’ouverture du dossier. Les demandes en cours, notifications non lues et actions de pointage du jour ne sont pas cachées.

## Vérifications locales — sans production

Sur une base PostgreSQL **jetable**, jamais sur Neon :

```bash
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL='postgres://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:5432/BASE_LOCALE_DE_TEST' npm test
```

Résultat local final : **51 tests réussis sur 51**, PostgreSQL réel et Chromium desktop/mobile. Les essais couvrent notamment la migration **020 → 021** et la reprise d’une ancienne photo, le menu masqué avec export direct encore permis, profils et révisions concurrents, rétablissement, glisser-déposer souris/tactile, recherche/pagination des historiques, recadrage/upload/suppression, droits sur photo personnelle, couverture générale et personnelle distinctes, icônes PWA et persistance après redémarrage. La suite complète des anciens modules est passée. Aucun déploiement ni contrôle de production n’a été effectué.

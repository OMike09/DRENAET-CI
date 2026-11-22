# DRENAET CI — application intégrée (colis 13)

Application Node.js/PostgreSQL destinée aux directions régionales et établissements. Le **colis 13** améliore les Comptes et accès et ajoute les **Annonces** officielles et **Mes demandes** des enseignants, sans supprimer les comptes, courriers, formations ni les autres données existantes. Voir [le guide du colis 13](ETAPE_13_ACTEURS_ANNONCES_DEMANDES.md) avant toute installation.

## Modules conservés

Comptes nominatifs, rôles, établissements, sessions et audit ; instructions et missions, messagerie, rapports, bibliothèque et agenda, statistiques et notifications, push facultatif, pièces privées et notes vocales, courriers historiques et bureau du courrier numérique, groupes, rappels et exports, Observatoire primaire/secondaire, formation continue et attestations à validation humaine. Aucune donnée antérieure n’est réinitialisée par le colis 13.

## Nouveautés

Huit catégories de comptes avec effectifs et recherche/filtrage serveur ; nouveaux rôles scolaires ACE/ACES et économe **sans reclassification automatique** ; fiches de périmètre, téléphone facultatif, export PDF/Excel et opérations groupées contrôlées. Annonces officielles ciblées par hiérarchie, rôle, DRENAET, établissement, groupe ou personne ; brouillons, visibilité planifiée, accusé de réception explicite, vues distinctes, suivi nominatif, relances et modifications versionnées. Publication fonctionnelle ACE/ACES, économe ou éducateur **uniquement vers des destinataires nominativement délégués**. Demandes privées des enseignants à leur chef, compléments, réponses et transmission possible à un directeur de la même DRENAET. Pièces PDF/images dans PostgreSQL : **10 Mio maximum par fichier**, quota initial global **100 Mio**, configurable jusqu’à **250 Mio** pour annonces et demandes. Ce palier n’est pas adapté aux grosses vidéos ou aux gigaoctets.

## Installation et vérification

Le **colis 12** et les migrations **001–012** sont des prérequis ; leur présence en production n’a **pas été confirmée** par l’utilisateur ni vérifiée par l’agent. Effectuer une sauvegarde et un test de restauration, copier le ZIP delta à la racine du projet **sans effacer les autres fichiers**, `npm ci` puis démarrer avec Node.js ≥20 et PostgreSQL direct non poolé. La migration 013 est appliquée au démarrage. Vérifier les parcours et les anciennes fonctions en préproduction avant tout déploiement. Les tests PostgreSQL/Chromium isolés sont détaillés dans [le guide](ETAPE_13_ACTEURS_ANNONCES_DEMANDES.md). Aucun déploiement Render ni test authentifié de Neon n’a été effectué par l’agent.

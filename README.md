# DRENAET CI — application intégrée (version 0.29.0)

**Étape 29 : audit ciblé des boutons d’annonces et contrôle de version déployée.** Lire [le rapport d’audit](AUDIT_29_BOUTONS_ANNONCES_DEPLOIEMENT.md). Delta à appliquer uniquement après 28 ; aucun code ne débloque un quota PostgreSQL épuisé.

**Étape 28 : améliorations ciblées des emplois du temps et annonces, non-refonte exhaustive.** Lire [le rapport et les limites du delta 28](ETAPE_28_EMPLOIS_ANNONCES_RAPPORT.md). Appliquer uniquement après le delta 27 et après sauvegarde/restauration de préproduction.

**Étape 27 : supervision régionale représentée et diagnostic de disponibilité.** Lire [le guide du delta 27](ETAPE_27_SUPERVISION_DIAGNOSTIC.md). Attention : ce colis ne relève aucun quota PostgreSQL et ne rétablit pas un service suspendu.

**Étape 26 : hiérarchie et rattachements réels.** Lire [le guide du delta essentiel et ses limites](ETAPE_26_HIERARCHIE_DELTA_ESSENTIEL.md). Ce delta s'applique uniquement après l'étape 25 ; le projet n'a été vérifié que localement. Les paragraphes historiques ci-dessous ne décrivent pas seuls l’état actuel. Ne jamais déployer sur une base de production sans sauvegarde, restauration testée et recette en préproduction.

---

# DRENAET CI — application intégrée (colis 15)

Application Node.js/PostgreSQL destinée aux directions régionales et établissements. Le **colis 13** améliore les Comptes et accès et ajoute les **Annonces** officielles et **Mes demandes** des enseignants, sans supprimer les comptes, courriers, formations ni les autres données existantes. Le colis 14 ajoute une année scolaire hiérarchisée, ses périodes, un socle pédagogique réel et un calendrier agrégé. Le colis 15 ajoute la programmation des devoirs et les surveillances automatiques avec validation humaine ; voir [le guide du colis 15](ETAPE_15_DEVOIRS_SURVEILLANCES.md) avant toute installation.

## Modules conservés

Comptes nominatifs, rôles, établissements, sessions et audit ; instructions et missions, messagerie, rapports, bibliothèque et agenda, statistiques et notifications, push facultatif, pièces privées et notes vocales, courriers historiques et bureau du courrier numérique, groupes, rappels et exports, Observatoire primaire/secondaire, formation continue et attestations à validation humaine. Aucune donnée antérieure n’est réinitialisée par le colis 15.

## Nouveautés

Le colis 15 ajoute « Devoirs et évaluations » pour le chef ou un ACE/ACES spécialement délégué et « Mon programme de surveillance » pour les enseignants : planification en lot, avertissements et contrôle serveur des conflits, propositions de surveillants selon disponibilité et équité, publication groupée atomique, gestion motivée des absences et remplacements, notifications avec consultations/accusés distincts, exports PDF/Excel et calendrier agrégé. Les affectations publiées ne sont pas écrasées par une nouvelle génération.


Le module « Année scolaire » (colis 14) définit les années et leurs périodes de référence, puis les déclinaisons régionales et locales ; il inclut délégation ACE/ACES, classes, affectations, devoirs/compositions, notes avec révisions, cahier de textes, événements de surveillance et emploi du temps, rapports attendus/remis, tableaux de bord calculés et calendrier personnel agrégé. Un suivi des notifications distingue envoi interne, consultation réelle de la fiche et accusé volontaire. Les échéances officielles sont bornées et les périodes closes ne permettent aucune note ordinaire.


Huit catégories de comptes avec effectifs et recherche/filtrage serveur ; nouveaux rôles scolaires ACE/ACES et économe **sans reclassification automatique** ; fiches de périmètre, téléphone facultatif, export PDF/Excel et opérations groupées contrôlées. Annonces officielles ciblées par hiérarchie, rôle, DRENAET, établissement, groupe ou personne ; brouillons, visibilité planifiée, accusé de réception explicite, vues distinctes, suivi nominatif, relances et modifications versionnées. Publication fonctionnelle ACE/ACES, économe ou éducateur **uniquement vers des destinataires nominativement délégués**. Demandes privées des enseignants à leur chef, compléments, réponses et transmission possible à un directeur de la même DRENAET. Pièces PDF/images dans PostgreSQL : **10 Mio maximum par fichier**, quota initial global **100 Mio**, configurable jusqu’à **250 Mio** pour annonces et demandes. Ce palier n’est pas adapté aux grosses vidéos ou aux gigaoctets.

## Installation et vérification

Le **colis 14** et les migrations **001–014** sont des prérequis ; l’utilisateur ne sait pas si le colis 14 est installé sur la cible. Il faut le vérifier avant de déployer ce delta ; Render/Neon n’ont pas été vérifiés par l’agent. Effectuer une sauvegarde et un test de restauration, copier le ZIP delta à la racine du projet **sans effacer les autres fichiers**, `npm ci` puis démarrer avec Node.js ≥20 et PostgreSQL direct non poolé. La migration 015 est appliquée au démarrage. Vérifier les parcours et les anciennes fonctions en préproduction avant tout déploiement. Les tests PostgreSQL/Chromium isolés sont détaillés dans [le guide](ETAPE_15_DEVOIRS_SURVEILLANCES.md). Aucun déploiement Render ni test authentifié de Neon n’a été effectué par l’agent.

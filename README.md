# DRENAET CI — application et bureau administratif numérique (colis 11)

Application Node.js/PostgreSQL pour les directions régionales et établissements. **Le colis 11 enrichit le registre de courriers existant sans le dupliquer** et préserve la Vue d’ensemble, les Statistiques, l’Observatoire régional, les Exports, les groupes et toutes les autres fonctions déjà présentes. Voir [le guide du colis 11](ETAPE_11_BUREAU_COURRIER_NUMERIQUE.md) avant l’installation.

## Modules conservés

- Comptes nominatifs, hiérarchie, sessions privées, protection CSRF et journal d’audit ; instructions, missions et alertes.
- Messagerie privée, rapports à circuits paramétrables, bibliothèque et agenda ; statistiques administratives, notifications et push web facultatif.
- Pièces privées incluant notes vocales (quota actuel borné, réglage administrateur), courriers historiques et groupes privés.
- Rappels automatiques sans doublons, exports historiques CSV/PDF/Excel et Observatoire régional (fiches déclarées et validées, primaire/secondaire, carte géolocalisée et rapports).

## Colis 11 : nouveau traitement du courrier dans le registre existant

Courrier entrant/sortant, numérotation transactionnelle, catégories/année/service, scan et pièces privées, modèles, circuits hiérarchiques configurés par les responsables, accusés de réception, suivi des traitements, validation/visa nominatif, PDF, archivage sans suppression et recherche. Quatre niveaux de confidentialité avec accès nominatif strict pour les deux niveaux supérieurs ; alertes et échéances intégrées. L’envoi externe par courriel pour un **sortant normal** exige un fournisseur SMTP privé configuré. Un visa interne n’est pas une signature électronique certifiée ; l’acceptation SMTP n’est pas une preuve de réception par le destinataire.

## Installation et tests

Node.js >=20, PostgreSQL direct non poolé, variables privées selon `.env.example`. Faire une **sauvegarde/restauration testée** et confirmer les migrations 001–010 avant d’ajouter la migration 011. Copier les fichiers du ZIP aux mêmes chemins **sans effacer ceux déjà installés**. `npm ci`, puis `npm start`. Ne jamais exposer les secrets SMTP ou de base de données dans le dépôt. Les tests avec PostgreSQL jetable et Chromium sont détaillés dans [le guide du colis 11](ETAPE_11_BUREAU_COURRIER_NUMERIQUE.md). **33/33 tests locaux réussis ; aucun déploiement ni test authentifié de ce colis en production par l’agent.** Le statut « colis 10 installé » est celui rapporté par l’utilisateur, non vérifié directement sur la base privée.

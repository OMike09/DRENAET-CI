# Colis 28 — delta essentiel, périmètre livré et limites

**Statut : étape partielle, non la refonte exhaustive demandée.** Appliquer par-dessus les colis 26 puis 27, jamais seul. Sauvegarder le projet et PostgreSQL, vérifier la restauration en préproduction, puis seulement déployer après rétablissement du quota de la base. Les tests décrits sont locaux ; aucun déploiement Render/Neon n'a été effectué. La migration 026 est additive pour les données ; elle remplace uniquement l'ancienne contrainte d'unicité qui empêchait plusieurs images par annonce. Les pièces anciennes restent intactes.

## 1. Fonctions déjà présentes et conservées

- Solveur à retour arrière borné et vérification des conflits de classe, professeur, salle, pauses, disponibilité hebdomadaire ; génération en brouillon, impossibilité explicite, correction manuelle, visa final du chef, notifications aux enseignants, historique, PDF/Excel, délégation ACE/ACES révocable.
- Catalogue de matières existant (environ 16 intitulés indicatifs, **non exhaustif**), affectations classe/enseignant et volume. Les niveaux et liens matière/niveau existent mais ne constituent pas une liste officiellement vérifiée par filière/série.
- Annonces : brouillons, ciblage selon l'autorité, notifications, suivi distinct de consultation/accusé, amendements audités, archives, PDF/images privés persistés en PostgreSQL, limites de stockage, recherche par titre. Les codes techniques d'état/priorité n'ont pas été modifiés.

## 2. Corrections et ajouts de cette étape

- **Emplois du temps** : durées de séance variables dans une matière (ex. 45 et 65 min pour 110 min hebdomadaires), jours obligatoirement autorisés, période matin/après-midi et maximum quotidien par volume. Validation côté serveur avant écriture, recherche du solveur et contrôle avant publication ; échec explicite si le volume est incompatible. Le chef ou l'ACE déjà délégué saisit ces critères dans le formulaire existant. Pas de publication automatique.
- PDF : vue hebdomadaire paysage par colonnes de jours et positions horaires, cours, professeur/classe, salles et pauses ; titre, année scolaire et établissement réels ; pas de charge statutaire ou de matricule inventé à partir de l'image de référence. Excel existant inchangé.
- **Annonces** : correction de la signature PNG qui refusait les vrais fichiers PNG ; plusieurs images durables par brouillon, galerie proportionnelle dans une carte responsive, consultation d'image protégée par session/autorisation, liens de documents ; auteur et unité. Avant publication, l'auteur peut masquer/réafficher/repositionner ses images sans effacer les octets ni les événements historiques. Anciennes annonces non altérées. Aperçu des brouillons avec leurs images.
- Un réglage global de couleur, typographie, tailles et choix de présentation, réservé à l'administrateur général et auditée. L'onglet d'aperçu local n'enregistre rien sans action manuelle. Les sept étiquettes de présentation ne sont **pas encore sept maquettes distinctes fidèles à la référence** ; certaines variantes ne diffèrent que par l'espacement, la largeur des images et les bordures.

## 3. Base de données et sécurité

- `migrations/026_timetable_constraints.sql` ajoute quatre colonnes facultatives aux volumes (`session_durations`, `allowed_days`, `period`, `max_per_day`), la table d'état visuel `announcement_file_layout` et les paramètres `announcement_appearance`.
- Une annonce peut désormais posséder plusieurs fichiers ; la contrainte d'unicité `(entity_type, entity_id, kind)` est retirée. Les anciens fichiers sont indexés par `announcement_file_layout` avec état visible. Pas de suppression automatique de fichiers ; données et audit historiques conservés. Les règles d'accès aux pièces et à leur affichage sont toujours vérifiées côté serveur.
- Les endpoints nouveaux sont dans `/api/communications/announcements/appearance` (lecture par utilisateur connecté, écriture par administrateur général) et `/api/communications/announcements/:id/files/:fileId/layout` (auteur d'un brouillon). `/api/communications/files/:id?inline=1` affiche uniquement une pièce autorisée.

## 4. Vérifications réalisées

Tests locaux PostgreSQL jetable + Chromium pour le générateur, les contraintes de durées/jours, la publication et la préservation de l'ancienne version ; galerie PNG avec deux images, cache privé et isolation, image masquée, réglage visuel avec refus régional et navigation mobile. La suite complète est détaillée dans le compte rendu final de livraison ; conserver le log local du résultat exact. Aucun test sur Render, Neon ni établissement réel. Les tests de migration historiques ont été mis à jour pour la version 026.

## 5. Travail restant — ne pas déclarer ces points opérationnels

- Catalogue **exhaustif et officiellement vérifié** des matières ivoiriennes par cycle, niveau, série et filière : non livré. Obtenir du demandeur ou d'une autorité compétente les référentiels actualisés, version et sources ; aucun volume ou maximum de service du formulaire photo n'a été déclaré obligatoire. Intégrer ensuite les classifications et sélections locales sans réécrire les anciennes affectations.
- Exceptions temporaires **datées** et remplacements ponctuels, cours entre établissements, créneaux personnalisés par jour, séances verrouillées, vraies variantes d'optimisation comparables, glisser-déposer, charge maximale validée par texte officiel, vue directeur/administrateur et vue parents/élèves : non livrés. Le générateur reste une grille hebdomadaire ; certaines activités datées existantes sont projetées sur leur jour de semaine et peuvent donc restreindre plus largement la recherche. À concevoir et tester explicitement avant de prétendre prendre en charge ces exceptions.
- Annonces : édition riche contrôlée, styles visuellement complets, galerie interactive plein écran, compression automatique, épinglage, commentaires, pagination serveur, recherche par contenu, PDF en aperçu intégré, archivage automatique configurable et synthèses statistiques complètes : non livrés. Les images de cette étape restent limitées par les quotas de stockage existants et une publication n'est modifiable que selon les règles antérieures.
- Ne pas modifier la base de production tant que son quota de connexion reste bloqué. Les sondes du delta 27 ne réparent pas une base indisponible. Après résolution du quota : sauvegarder, appliquer les migrations une fois, vérifier logs et parcours réels.

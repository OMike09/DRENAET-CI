# DRENAET CI — application intégrée (colis 12)

Application Node.js/PostgreSQL pour les directions régionales et les établissements. Le **colis 12 ajoute la formation continue** aux modules précédents, sans les remplacer. Lire [le guide d’installation et de fonctionnement du colis 12](ETAPE_12_FORMATION_CONTINUE.md) avant de copier le ZIP delta.

## Modules conservés

Comptes nominatifs, rôles, établissements, sessions privées, protection CSRF et audit ; instructions, missions, messagerie, rapports, bibliothèque et agenda ; statistiques, notifications, push facultatif ; pièces privées et notes vocales ; groupes et registre historique des courriers, bureau du courrier numérique, rappels et exports ; Observatoire primaire/secondaire avec carte et fiches validées.

## Formation continue

Catalogue par domaine/discipline et public cible, calendrier de séances, comptes formateurs désignés par un responsable, publication contrôlée, invitations/inscriptions et liste d’attente, présence, évaluations QCM/réponse courte/exercice pratique, résultats et espace personnel. Supports PDF/PPTX/images/petites vidéos stockés directement en PostgreSQL (**10 Mio par fichier**, quota initial **100 Mio**, administrable jusqu’à **500 Mio au total**). Besoins de formation, rappels, tableau régional et exports PDF/Excel. **Le formateur propose une attestation ; seul un responsable habilité peut la valider avant création du PDF et de la référence vérifiable.** La référence de vérification ne doit pas être publiée sans nécessité. Ce palier ne prend pas en charge les longues vidéos ou les gigaoctets.

## Installation et tests

Node.js ≥ 20, PostgreSQL direct non poolé, variables privées selon `.env.example`. Le colis 11 et les migrations **001–011** doivent être présents avant le colis 12 ; vérifier cette condition **sur la base ciblée**, effectuer sauvegarde et restauration de contrôle. Copier les fichiers du ZIP delta aux chemins indiqués **sans effacer les autres fichiers**, exécuter `npm ci`, puis démarrer. La migration 012 est appliquée par l’application au démarrage. Ne jamais publier les secrets de base, SMTP ou push. Commande de test PostgreSQL isolé et Chromium dans [le guide](ETAPE_12_FORMATION_CONTINUE.md). **36/36 tests locaux réussis ; aucun déploiement ni test authentifié du colis 12 en production par l’agent.** L’installation du colis 11 a été rapportée par l’utilisateur, non vérifiée directement sur Neon/Render.

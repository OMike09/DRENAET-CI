# DRENAET CI — colis 7 : pièces jointes privées et notes vocales

## Ce qui est livré

- Après la création d'une **instruction**, d'une **mission** ou d'un **rapport**, ses participants autorisés peuvent joindre et télécharger un fichier. Aucun fichier n'est public : session et droits sur le dossier sont revérifiés côté serveur à chaque liste, ajout et téléchargement. L'administrateur général n'accède pas automatiquement aux dossiers privés d'autrui. Une réaffectation vers une autre DRENAET retire l'accès aux anciennes pièces, même si la personne figurait parmi les participants historiques.
- PDF, PNG, JPEG, WebM audio, Ogg audio, MP3, M4A/MP4 audio et WAV. Contrôle du format déclaré, de l'extension et d'une **signature élémentaire** ; cela ne remplace **pas un antivirus** ni une analyse approfondie du fichier. Pas de SVG, HTML, exécutable ou format arbitraire. Téléchargement servi avec `nosniff`, `Content-Disposition: attachment` et absence de cache privé persistant.
- Une personne équipée d'un navigateur compatible et autorisant le microphone peut enregistrer une note vocale depuis le dossier (2 minutes au plus). Le navigateur choisit un format pris en charge et l'enregistrement devient une pièce jointe ordinaire : accès, téléchargement, écoute et quotas identiques. Sur un appareil incompatible, on peut déposer un fichier audio déjà enregistré. **Le test Chromium simule le microphone ; aucun téléphone physique n'a été testé.** HTTPS est requis pour le microphone hors localhost.
- Dépôts horodatés, auteur, taille, empreinte SHA-256, audit d'ajout, de téléchargement et de changement de limites. Les pièces sont en `BYTEA` PostgreSQL ; un déclencheur empêche leur modification ou suppression par les routes ordinaires. Le dossier textuel et ses événements/versions ne sont pas écrasés. Les pièces d'un rapport mémorisent le numéro de sa version : celles de versions précédentes demeurent consultables après correction. Aucun dépôt nouveau après approbation finale du rapport.

## Taille et capacité : limites réelles

Départ : **10 Mio par fichier**, **100 Mio cumulés** sur toutes les pièces du module. Seul l'**administrateur général** peut régler ces valeurs dans **Mon profil**, entre **1 et 10 Mio par fichier** et **20 et 250 Mio au total**. Réduire le maximum d'un fichier ne supprime pas les fichiers existants ; il n'est pas possible de réduire le quota total sous l'usage actuel. Les contrôles sont aussi appliqués par PostgreSQL et l'API, et les dépôts concurrents sont sérialisés sur la ligne de réglage. Le quota concerne les nouvelles pièces de ce module, **pas** la bibliothèque antérieure ni la taille physique totale de la base : PostgreSQL ajoute ses index, WAL et sauvegardes. Pour des fichiers de plusieurs Go ou une capacité importante, il faudra concevoir un stockage d'objets privé avec contrôle d'accès, sauvegarde et quotas distincts. **Aucun stockage illimité n'est promis.**

## Installation prudente — delta après le colis 6

1. Vérifier que les **colis 1 à 6** sont réellement installés dans le dépôt et la base visée. Sauvegarder la base de production et vérifier la restauration **avant** l'opération. Prévoir l'espace libre PostgreSQL et les sauvegardes compte tenu du quota choisi. Ne pas lancer les tests de bases jetables sur la production.
2. Copier les fichiers du ZIP aux **mêmes chemins**, sans supprimer ou remplacer les fichiers non présents dans le delta. Ce ZIP ne fonctionne pas seul. Ne jamais placer `DATABASE_URL`, mots de passe, clés VAPID, dumps, fichiers de test locaux ou le ZIP lui-même comme code source dans GitHub. Ne pas modifier les secrets privés Render/Neon pour cette fonctionnalité.
3. Installer les dépendances du projet (`npm ci` avec Node.js 20 ou supérieur) puis redéployer/redémarrer le Web Service, seulement après accord opérationnel. La connexion PostgreSQL doit rester **directe, non poolée** ; au démarrage, `db.js` applique automatiquement la migration additive `007_professional_attachments.sql` dans le schéma `drenaet_ci`. Vérifier les logs et `/healthz`. En cas d'échec, ne pas tenter de réappliquer partiellement la migration à la main ; diagnostiquer avec une sauvegarde et les logs sans divulguer de secrets.
4. Avec des comptes de test autorisés, vérifier les trois dossiers, le dépôt PDF/audio, le téléchargement/écoute, les refus pour un compte hors dossier ou d'une autre DRENAET, l'audit et les réglages du profil. Vérifier les sauvegardes et leur politique de conservation **incluant les nouveaux octets**. Laisser la fonctionnalité désactivée opérationnellement si l'espace ou la sauvegarde ne sont pas maîtrisés.

Aucune écriture dans GitHub/Render/Neon et aucun test authentifié sur la production n'ont été réalisés pour ce colis par l'agent.

## Validation locale du colis

Sur une instance PostgreSQL **locale jetable**, avec un rôle SQL autorisé à créer/supprimer ses bases de tests :

```text
npm ci
npx playwright install chromium
AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=postgres://<URL-LOCALE-DE-TEST> npm test
npm audit --omit=dev --audit-level=high
```

**22/22 tests réussis** sur PostgreSQL local et Chromium simulé, sans test ignoré : migration 006→007 sans perte d'un document/alerte anciens, versions des rapports, taille et quota, signatures, isolation entre régions et après réaffectation, audit, redémarrage ; parcours mobile des instructions/missions/rapports, dépôt, téléchargement, microphone simulé et réglage administrateur. `npm audit` doit être contrôlé séparément lors de chaque installation ; l'état réel d'un autre hébergement n'est pas déduit de ces tests. Aucune analyse antivirale, garantie de conservation externe ou réception audio sur appareil physique n'est incluse.

# DRENAET CI — étape 4 : bibliothèque privée et calendrier

## Contenu implémenté

**Bibliothèque :** documents PDF/PNG/JPEG jusqu'à **2 Mio par fichier**, stockés en `bytea` PostgreSQL (aucun disque Render éphémère). Taille, extension et signature contrôlées par le serveur ; l'interface ne suffit jamais à valider un téléversement. Types SVG/HTML/exécutables et formats Office refusés dans ce lot. Un PDF peut malgré tout contenir du contenu malveillant : **aucun antivirus n'est intégré** ; téléchargement forcé en pièce jointe, `nosniff`, cache désactivé. Ne déposer que des fichiers institutionnels autorisés, pas de données d'élèves ou de parents.

Périmètres de publication :

| Périmètre | Qui peut publier | Qui peut consulter et télécharger |
|---|---|---|
| Moi uniquement | Chaque compte actif | Son auteur seulement |
| Établissement | Chef d'établissement ou adjoint de l'établissement | Comptes actifs affectés au même établissement et à la même région |
| Direction régionale | Directeur régional | Comptes actifs affectés à sa région |
| Général | Administrateur général | Comptes actifs authentifiés de toutes les régions |

L'administrateur ne voit pas automatiquement les documents personnels d'un enseignant. Le téléchargement et la publication sont audités. Le créateur peut **archiver** (confirmation dans l'interface) : le fichier n'est pas effacé ; il est masqué aux autres, mais reste téléchargeable par l'auteur tant que son affectation permet la consultation. Aucun mécanisme d'effacement n'est exposé. La liste et le téléchargement appliquent les mêmes droits côté serveur. Aucune pièce jointe automatique aux messages ou rapports.

**Calendrier :** mêmes périmètres et pouvoirs de création ; titre, description, lieu facultatifs, début/fin et durée ≤30 jours. La création accepte un début entre un an dans le passé et deux ans dans le futur ; affichage mensuel par grille sur ordinateur et liste adaptée aux petits écrans. Modification limitée à l'auteur toujours habilité et à un événement actif ; contrôle de la révision pour éviter d'écraser une autre modification. Une annulation conserve dates, auteur, ancienne version et historique append-only. Un autre compte de la même région ou un administrateur non auteur ne peut modifier silencieusement un événement d'un collègue. Pas de rappels, d'invités, de push ni de synchronisation avec un agenda externe.

## Validation effectuée localement

- API sur PostgreSQL réel : droits entre deux régions et deux établissements d'une même région, formats et tailles rejetés, fichier binaire rendu à l'identique après téléchargement, accès anonyme ou hors périmètre refusé, archivage sans suppression, contrôles de versions et conservation après redémarrage.
- Migration **003→004** testée avec conversation et rapport antérieurs ; conservation vérifiée. Les tests historiques des étapes 1–3 sont rejoués.
- Chromium bureau et viewport mobile simulé : dépôt PDF, téléchargement via navigateur, affichage du calendrier, modification et annulation. **Ni appareil physique, ni push, ni base Neon/Render n'ont été testés pour ce colis.**
- `AC_RUN_BROWSER_TESTS=1 TEST_DATABASE_URL=<base PostgreSQL locale de test> npm test` : **13 tests réussis, 0 échec** lors de la dernière exécution locale. `npm audit --omit=dev --audit-level=high` : **0 vulnérabilité signalée** lors de la vérification locale.

## Conditions d'installation

Ce colis ne comprend que le **delta du colis 3**, sans projets complets, identifiants, URLs de base, anciennes données ni APK. Décompresser et conserver l'arborescence. La migration 004 est **automatique et transactionnelle** au démarrage ; ne pas démarrer sur la base réelle sans inventaire, sauvegarde et restauration vérifiée. La connexion Neon doit rester **directe non poolée** ; ne pas modifier ou divulguer les variables privées Render pour appliquer ce delta. Vérifier l'espace disponible en PostgreSQL avant d'autoriser des fichiers à plusieurs directions. L'application déjà publique des étapes précédentes n'a pas été modifiée par les tests locaux.

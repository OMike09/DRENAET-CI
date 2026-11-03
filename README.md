# EDUC CI — Service de téléchargement APK (pour Render)

Ce dossier est un **service web autonome** qui sert l'APK EDUC CI au téléchargement.
Il est conçu pour être **copié dans votre repo `drenaet-ci` existant** (sous-dossier)
et déployé comme **nouveau service** sur Render.

## Contenu
- `server.js` — serveur Node.js léger (pas de dépendances externes)
- `package.json` — manifeste Node
- `Dockerfile` — image Docker pour Render
- `render.yaml` — configuration du service Render
- `EDUC_CI_v1.0.0.apk` — l'application Android (65 KB)

## Comment l'intégrer dans votre repo `drenaet-ci`

### Option 1 — Copier le dossier (recommandé)
1. Copier ce dossier `educ-ci-apk/` dans votre repo `drenaet-ci`.
2. Si votre repo a déjà un `render.yaml`, **fusionner** la section de service ci-dessous
   dans votre fichier existant (ne pas avoir deux fichiers `render.yaml`).
3. Pousser sur GitHub : `git add educ-ci-apk && git commit -m "APK EDUC CI" && git push`
4. Render détecte le changement et deploye automatiquement (ou cliquez « Deploy » dans le dashboard).

### Option 2 — Service séparé
Si vous voulez un service Render séparé pour l'APK, gardez ce `render.yaml` tel quel
et assurez-vous qu'il est le `render.yaml` racine du repo (ou renommez le votre et
placez celui-ci en racine temporairement).

## Section `render.yaml` à fusionner

```yaml
services:
  - type: web
    name: educ-ci-apk
    runtime: docker
    plan: free
    dockerfilePath: ./educ-ci-apk/Dockerfile
    healthCheckPath: /
    envVars:
      - key: PORT
        value: "10000"
    autoDeploy: true
```

> Si votre repo utilise déjà un Dockerfile racine, orientez `dockerfilePath` vers
> `./educ-ci-apk/Dockerfile`. Si vous utilisez le runtime Node (pas Docker), remplacez
> `runtime: docker` par `runtime: node` et supprimez `dockerfilePath`.

## URLs après déploiement
- Page de présentation : `https://<app>.onrender.com/`
- Téléchargement direct : `https://<app>.onrender.com/EDUC_CI_v1.0.0.apk`
- Chemin alternatif : `https://<app>.onrender.com/download`

## Comptes de démonstration (dans l'APK)
`admin/admin123` · `dre.adzope/1234` · `dre.katiola/1234` · `insp.adzope/1234` ·
`chef.epaz/1234` · `chef.lycee/1234` · `censeur/1234` · `edu.lycee/1234` ·
`ens.math/1234` · `ens.fr/1234`

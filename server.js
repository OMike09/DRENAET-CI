/* EDUC CI — Serveur de téléchargement APK pour Render */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 10000;
const APK = path.join(__dirname, 'EDUC_CI_v1.0.0.apk');
const APK_NAME = 'EDUC_CI_v1.0.0.apk';

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];

  // Téléchargement direct de l'APK (chemins explicites)
  if (url === '/download' || url === '/' + APK_NAME || url === '/apk' || url === '/EDUC_CI_v1.0.0.apk') {
    try {
      const stat = fs.statSync(APK);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="' + APK_NAME + '"'
      });
      fs.createReadStream(APK).pipe(res);
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('APK non trouvé');
      return;
    }
  }

  // Page de présentation avec bouton de téléchargement
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EDUC CI — APK</title>
<style>
  body{font-family:"Segoe UI",Roboto,Arial,sans-serif;background:#1B5E20;color:#fff;text-align:center;padding:60px 20px;margin:0}
  .card{background:#fff;color:#1E2A23;border-radius:20px;padding:40px 30px;max-width:480px;margin:0 auto;box-shadow:0 20px 60px rgba(0,0,0,.3)}
  h1{color:#1B5E20;margin:0 0 8px;letter-spacing:2px}
  .sub{color:#63746A;font-size:13px;margin-bottom:24px}
  .ver{display:inline-block;background:#E8F5E9;color:#1B5E20;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:700;margin-bottom:20px}
  a.dl{display:inline-block;background:#2E7D32;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:16px}
  a.dl:hover{background:#1B5E20}
  .note{color:#9AAA9F;font-size:11px;margin-top:18px}
  .size{color:#63746A;font-size:12px;margin-top:8px}
</style>
</head>
<body>
<div class="card">
  <h1>🎓 EDUC CI</h1>
  <div class="sub">Plateforme nationale de gestion éducative<br>Direction Régionale de l'Éducation Nationale, de l'Alphabétisation et de l'Enseignement Technique</div>
  <div class="ver">APK v1.0.0 · Android 8.0+</div>
  <a class="dl" href="/${APK_NAME}" download>⬇ Télécharger l'APK</a>
  <div class="size">~65 KB · application installable</div>
  <div class="note">Comptes de démonstration : admin/admin123 · dre.adzope/1234 · chef.lycee/1234 · censeur/1234 · ens.math/1234</div>
</div>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('EDUC CI APK server démarré sur port ' + PORT);
});

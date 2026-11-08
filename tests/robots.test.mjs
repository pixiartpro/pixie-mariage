// La sécurité d'avant l'ouverture (analyse croisée du dimanche 08/11/2026) :
//  [13] contre les robots, avant d'ouvrir la création au public : un plafond par visiteur dans la base
//       (supabase/schema.sql, rejoué par npm run test:sql), un champ piège dans le formulaire, et la page « vos données » qui le dit ;
//  [11] les en-têtes de sécurité du jour du passage sur Hostinger (hebergement/hostinger, rejoués par npm run test:hostinger).
// Ces tests empêchent qu'une retouche affaiblisse l'un des deux sans qu'on le voie.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lire = (chemin) => readFileSync(new URL(`../${chemin}`, import.meta.url), "utf8");

test("le formulaire de création a son champ piège, lu avant toute création", () => {
  const src = lire("components/appli/EspaceMaries.js");
  assert.match(src, /<input id="site_web" name="site_web" type="text" tabIndex=\{-1\} autoComplete="off"/, "champ piège absent, ou atteignable au clavier");
  assert.match(src, /className="ed-piege" aria-hidden="true"/, "le champ piège doit être ignoré des lecteurs d'écran");
  const piege = src.indexOf('get("site_web")');
  assert.ok(piege > -1 && piege < src.indexOf("await creerMariage("), "le piège doit être lu avant l'appel à la base");
  assert.match(lire("app/appli.css"), /\.ed-piege \{ position: absolute !important; left: -10000px !important;/, "le champ piège doit rester hors de l'écran");
});

test("la base plafonne les créations par visiteur, et la page « vos données » le dit", () => {
  const sql = lire("supabase/schema.sql");
  assert.match(sql, /perform public\.pm_plafond_visiteur\('creer_mariage', \d+\);/, "mariage_creer doit appeler le plafond par visiteur");
  assert.match(sql, /extensions\.hmac\(/, "le visiteur n'est connu que par une empreinte HMAC");
  assert.match(sql, /cron\.schedule\('pm-purge-visiteurs'/, "les empreintes doivent être effacées chaque nuit");
  const page = lire("app/(salon)/appli-du-mariage/confidentialite/page.js");
  assert.match(page, /empreinte de votre adresse internet/);
  assert.match(page, /effacée au plus tard 48 heures après/);
});

test("les règles de Hostinger gardent tous leurs en-têtes de sécurité", () => {
  const m = lire("hebergement/hostinger/htaccess.modele");
  for (const e of ["Strict-Transport-Security", "Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) {
    assert.match(m, new RegExp(`Header always set ${e} "`), `${e} manque`);
  }
  assert.match(m, /connect-src 'self' __SUPABASE_URL__;/, "la page ne doit parler qu'à sa propre base");
  assert.match(m, /frame-ancestors 'none'/);
  assert.doesNotMatch(m, /\*\.supabase\.co|https?:\/\/\*/, "pas de joker dans la CSP");
});

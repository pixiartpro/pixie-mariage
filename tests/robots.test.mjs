// La sécurité d'avant l'ouverture (analyse croisée du dimanche 08/11/2026) :
//  [13] contre les robots, avant d'ouvrir la création au public : un plafond par visiteur dans la base
//       (supabase/schema.sql, rejoué par npm run test:sql), un champ piège dans le formulaire, et la page « vos données » qui le dit ;
//  [11] les en-têtes de sécurité envoyés par Vercel (vercel.json), que GitHub Pages ne pouvait pas envoyer.
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

test("Vercel envoie tous les en-têtes de sécurité, et la page ne parle qu'à sa propre base", () => {
  const v = JSON.parse(lire("vercel.json"));
  const entetes = Object.fromEntries(v.headers.find((r) => r.source === "/(.*)").headers.map((h) => [h.key, h.value]));
  for (const e of ["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) {
    assert.ok(entetes[e], `${e} manque dans vercel.json`);
  }
  const csp = entetes["Content-Security-Policy"];
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /default-src 'self'/);
  assert.doesNotMatch(csp, /\*/, "pas de joker dans la CSP");
  // La base : tant qu'elle n'existe pas, la page ne parle qu'au site. Le jour où l'adresse de la base est posée
  // (NEXT_PUBLIC_SUPABASE_URL), elle doit être dans connect-src, sinon l'appli ne pourrait pas lui parler.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const connect = csp.match(/connect-src ([^;]+)/)[1].trim();
  assert.equal(connect, base ? `'self' ${base}` : "'self'", "connect-src doit être le site, plus la base de Pixie Mariage si elle existe");
  // Vercel sert le dossier construit tel quel (comme GitHub Pages), avec les mêmes adresses à barre finale.
  assert.equal(v.outputDirectory, "out");
  assert.equal(v.trailingSlash, true);
});

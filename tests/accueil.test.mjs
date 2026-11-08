// L'accueil doit intéresser dès l'arrivée. Retour d’une première visiteuse, le dimanche 08/11/2026 : « c'était sympa,
// mais il manquait quelque chose pour que, quand on arrive dessus, ça nous intéresse réellement ».
// L'ancien accueil faisait 15 écrans de téléphone, 1 220 mots, sans aucune image.
// Ces tests gardent les trois remèdes : une vraie image en haut, les outils offerts juste dessous, une page courte.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

const ICI = (chemin) => new URL(`../${chemin}`, import.meta.url).pathname;
const OUT = ICI("out/");
const LIMITE_MOTS = 950; // 779 mots le dimanche 08/11/2026

test("l'accueil garde sa vraie photo, et ses images restent légères", () => {
  const page = readFileSync(ICI("app/(salon)/page.js"), "utf8");
  assert.match(page, /from "\.\.\/images\/alliances\.webp"/, "la photo des alliances (un vrai mariage filmé par PIX-I-ART) doit rester en haut de l'accueil");
  for (const f of ["alliances.webp", "appli-demo.webp"]) {
    assert.ok(statSync(ICI(`app/images/${f}`)).size < 80_000, `${f} dépasse 80 Ko : l'accueil doit rester rapide en 4G`);
  }
});

// Le texte qu'on lit sur une page construite : sans scripts, styles ni balises.
const texte = (html) =>
  html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");

test("après construction : la vraie image en haut, les outils offerts juste après, une page courte", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const html = readFileSync(`${OUT}index.html`, "utf8");
  const debut = html.indexOf('<section class="accueil"');
  assert.ok(debut > -1, "le premier écran de l'accueil a disparu");
  const premierEcran = html.slice(debut, html.indexOf("</section>", debut));
  assert.match(premierEcran, /<img[^>]*alt="Échange des alliances/, "la vraie photo n'est plus dans le premier écran");
  const offert = html.indexOf('id="offert"');
  assert.ok(offert > debut && offert < html.indexOf('class="metiers"'), "les outils offerts doivent venir juste après le premier écran, avant les métiers");
  const mots = texte(html).split(/\s+/).filter(Boolean).length;
  assert.ok(mots < LIMITE_MOTS, `l'accueil compte ${mots} mots : il redevient un long texte (limite ${LIMITE_MOTS})`);
});

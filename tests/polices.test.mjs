// Les polices du site sont rangées dans le dépôt (app/polices/). Avant le dimanche 08/11/2026, la construction allait
// les chercher chez Google Fonts (next/font/google) et ratait parfois, trois fois ce jour-là.
// Ces tests empêchent d'y revenir par mégarde, et vérifient que le site construit ne demande rien à Google.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ICI = (chemin) => new URL(`../${chemin}`, import.meta.url).pathname;
const OUT = ICI("out/");

function fichiers(dossier, extensions) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) return fichiers(chemin, extensions);
    return extensions.test(e.name) ? [chemin] : [];
  });
}

test("les polices viennent du dépôt, jamais de Google Fonts", () => {
  const sources = ["app", "components", "lib"].flatMap((d) => fichiers(ICI(d), /\.(js|jsx|mjs|css)$/));
  const google = sources.filter((f) => /next\/font\/google|fonts\.googleapis|fonts\.gstatic/.test(readFileSync(f, "utf8")));
  assert.deepEqual(google, [], "une police est de nouveau demandée à Google : la ranger dans app/polices/ (next/font/local)");
  for (const f of ["cormorant-garamond-latin.woff2", "jost-latin.woff2"]) {
    assert.ok(statSync(ICI(`app/polices/${f}`)).size > 10_000, `${f} manque ou est vide`);
  }
  assert.match(readFileSync(ICI("app/polices/LICENCES.txt"), "utf8"), /Open Font License/, "la licence des polices doit rester à côté d'elles");
});

test("après construction : aucune adresse de Google dans les pages ni dans les styles", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const servis = fichiers(OUT, /\.(html|css)$/).filter((f) => /fonts\.(googleapis|gstatic)\.com/.test(readFileSync(f, "utf8")));
  assert.deepEqual(servis, []);
});

// Le site ne charge que les icônes qu'il utilise (scripts/icones.mjs) : 15 Ko au lieu de 878 Ko.
// Le risque : ajouter une icône dans le code sans relancer « npm run icones ». Elle resterait vide à l'écran.
// Ces tests le refusent, et vérifient que la grosse police ne revient pas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { catalogueTabler, iconesUtilisees } from "../scripts/icones.mjs";

const ICI = (chemin) => new URL(`../${chemin}`, import.meta.url).pathname;
const OUT = ICI("out/");
const catalogue = catalogueTabler();
const css = readFileSync(ICI("app/icones.css"), "utf8");
const regles = new Map([...css.matchAll(/\.ti-([a-z0-9-]+):before \{ content: "\\([0-9a-f]+)"; \}/g)].map((m) => [m[1], m[2]]));

test("chaque icône du code a sa règle dans app/icones.css, avec le bon caractère", () => {
  const manquantes = iconesUtilisees(catalogue).filter((nom) => !regles.has(nom));
  assert.deepEqual(manquantes, [], `icônes absentes de app/icones.css : lancer « npm run icones »`);
  for (const [nom, code] of regles) assert.equal(code, catalogue.get(nom), `.ti-${nom} ne pointe pas sur le bon caractère`);
});

test("la police des icônes reste petite, et la police complète n'est plus chargée", () => {
  assert.match(css, /src: url\("\.\/polices\/tabler-icones\.woff2"\) format\("woff2"\)/);
  assert.ok(statSync(ICI("app/polices/tabler-icones.woff2")).size < 60_000, "la police des icônes dépasse 60 Ko");
  assert.ok(!readFileSync(ICI("app/layout.js"), "utf8").includes("tabler-icons.min.css"), "la police complète (878 Ko) est de nouveau importée");
});

function pages(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) return pages(chemin);
    return e.name.endsWith(".html") ? [chemin] : [];
  });
}

test("après construction : chaque icône des pages a sa règle, et la grosse police n'est pas publiée", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const vues = new Set();
  for (const page of pages(OUT)) {
    for (const m of readFileSync(page, "utf8").matchAll(/\bti-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) if (catalogue.has(m[1])) vues.add(m[1]);
  }
  assert.ok(vues.size > 10, "les pages construites devraient montrer des icônes");
  assert.deepEqual([...vues].filter((nom) => !regles.has(nom)), [], "icônes affichées sans règle : lancer « npm run icones »");
  const media = join(OUT, "_next/static/media");
  const lourdes = existsSync(media) ? readdirSync(media).filter((f) => /tabler/i.test(f) && statSync(join(media, f)).size > 100_000) : [];
  assert.deepEqual(lourdes, [], "une police d'icônes de plus de 100 Ko est publiée (reconstruire avec npm run build)");
});

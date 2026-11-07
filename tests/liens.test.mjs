// Après « npm run build » : chaque lien interne du site construit (out/) mène à une vraie page ou un vrai fichier.
// Le site vit à la racine de pixie-mariage.re : un lien interne commence par « / » (et pas par « // »).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const SANS_BUILD = !existsSync(OUT) && "lancer npm run build d'abord";

function pages(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? pages(p) : n.endsWith(".html") ? [p] : [];
  });
}
const existe = (chemin) => {
  const c = decodeURIComponent(chemin.split("#")[0].split("?")[0]);
  const p = join(OUT, c);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, "index.html")));
};

test("aucun lien interne cassé dans le site construit", { skip: SANS_BUILD }, () => {
  const casses = [];
  for (const f of pages(OUT)) {
    const html = readFileSync(f, "utf8");
    for (const m of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) if (!existe(m[1])) casses.push(`${f.replace(OUT, "")} → ${m[1]}`);
  }
  assert.deepEqual([...new Set(casses)], []);
});

test("le site connaît sa propre adresse, et plus aucune page ne renvoie vers l'ancienne", { skip: SANS_BUILD }, () => {
  assert.equal(readFileSync(join(OUT, "CNAME"), "utf8").trim(), "pixie-mariage.re");
  assert.match(readFileSync(join(OUT, "robots.txt"), "utf8"), /Sitemap: https:\/\/pixie-mariage\.re\/sitemap\.xml/);
  const anciennes = pages(OUT).filter((f) => readFileSync(f, "utf8").includes("pixiartpro.github.io/pixie-mariage"));
  assert.deepEqual(anciennes.map((f) => f.replace(OUT, "")), []);
});

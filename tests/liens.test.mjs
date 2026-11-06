// Après « npm run build » : chaque lien interne du site construit (out/) mène à une vraie page ou un vrai fichier.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const PREFIXE = "/pixie-mariage";

function pages(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? pages(p) : n.endsWith(".html") ? [p] : [];
  });
}
const existe = (chemin) => {
  const c = decodeURIComponent(chemin.split("#")[0].split("?")[0]).replace(PREFIXE, "");
  const p = join(OUT, c);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, "index.html")));
};

test("aucun lien interne cassé dans le site construit", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const casses = [];
  for (const f of pages(OUT)) {
    const html = readFileSync(f, "utf8");
    for (const m of html.matchAll(/(?:href|src)="(\/pixie-mariage[^"]*)"/g)) if (!existe(m[1])) casses.push(`${f.replace(OUT, "")} → ${m[1]}`);
  }
  assert.deepEqual([...new Set(casses)], []);
});

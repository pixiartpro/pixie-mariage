// Le papier ne se corrige pas : chaque QR déjà imprimé doit toujours mener à une vraie page.
// Deux façons de casser un QR distribué : renommer ou retirer la page qu'il vise (ce test l'empêche), ou déménager le site
// sans renvoyer l'ancienne adresse (tests/renvoi.test.mjs l'empêche). La liste des QR : contenu/qr-imprimes.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
export const IMPRIMES = JSON.parse(readFileSync(new URL("../contenu/qr-imprimes.json", import.meta.url), "utf8")).qr;

test("chaque page visée par un QR imprimé existe toujours", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  assert.ok(IMPRIMES.length >= 3, "la liste des QR imprimés a été vidée");
  for (const { page, document } of IMPRIMES) {
    assert.ok(existsSync(join(OUT, page, "index.html")), `${page} a disparu : le QR du document « ${document} » mènerait à une page vide`);
  }
});

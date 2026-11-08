// Relecture du site à l'aveugle par ChatGPT, le dimanche 08/11/2026 : deux défauts à ne pas laisser revenir.
// 1. Après le passage sur Vercel, les mentions légales citaient encore GitHub comme prestataire des pages,
//    alors que la page « vos données » de l'appli disait Vercel. Les textes légaux doivent nommer le même hébergeur.
// 2. Les fiches d'exemple parlaient en formules interchangeables (« écrin tropical », « parenthèse hors du temps ») :
//    elles disent maintenant ce qu'un couple compare (lieu, capacité, ce qui est compris).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRESTATAIRES } from "../lib/data.js";

const lire = (chemin) => readFileSync(new URL(`../${chemin}`, import.meta.url), "utf8");

test("mentions légales et page « vos données » : le même hébergeur, Vercel, et plus GitHub", () => {
  assert.equal(JSON.parse(lire("vercel.json")).outputDirectory, "out", "le site doit être servi par Vercel");
  for (const f of ["contenu/mentions-legales.html", "app/(salon)/appli-du-mariage/confidentialite/page.js"]) {
    const t = lire(f);
    assert.doesNotMatch(t, /GitHub/, `${f} cite encore GitHub`);
    assert.match(t, /Vercel/, `${f} doit nommer Vercel`);
  }
});

test("les fiches d'exemple disent des faits, pas des formules toutes faites", () => {
  const formules = /écrin|parenthèse hors du temps|sublim|éthéré|tendresse infinie|sensibilité rare|sérénité absolue|figées pour toujours/i;
  const fautives = PRESTATAIRES.filter((p) => formules.test(`${p.accroche} ${p.description}`)).map((p) => p.slug);
  assert.deepEqual(fautives, [], "réécrire ces fiches avec des faits concrets : lieu, capacité, ce qui est compris");
});

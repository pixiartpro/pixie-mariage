// Garde-fous sur les données du salon : un vrai stand ne part jamais en ligne sans l'adresse où le pro reçoit ses demandes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { PRESTATAIRES, SALON } from "../lib/data.js";

test("chaque vrai stand a l'adresse où le pro reçoit lui-même les demandes", () => {
  for (const p of PRESTATAIRES.filter((x) => !x.exemple)) {
    assert.match(p.email || "", /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i, `stand ${p.slug} : adresse manquante ou illisible`);
    assert.notEqual(p.email, SALON.email, `stand ${p.slug} : les demandes doivent aller au pro, pas au salon`);
  }
});

test("la phrase kréol appartient au salon de La Réunion, les outils restent neutres", () => {
  // Validée par Guillaume le samedi 07/11/2026 : la marque Pixie Mariage s'exporte, chaque salon régional a sa phrase.
  assert.equal(SALON.phrase, "Pou in zoli mariaz");
  const dossier = new URL("../components/appli/", import.meta.url);
  for (const f of readdirSync(dossier).filter((x) => x.endsWith(".js"))) {
    const code = readFileSync(new URL(f, dossier), "utf8");
    assert.ok(!code.includes("SALON.phrase") && !code.includes(SALON.phrase), `${f} : l'appli et l'espace exposant ne portent pas la phrase d'une région`);
  }
});

test("les adresses des stands sont uniques", () => {
  const vus = new Set();
  for (const p of PRESTATAIRES) {
    assert.ok(!vus.has(p.slug), `adresse en double : ${p.slug}`);
    vus.add(p.slug);
  }
});

// Garde-fous sur les données du salon : un vrai stand ne part jamais en ligne sans l'adresse où le pro reçoit ses demandes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESTATAIRES, SALON } from "../lib/data.js";

test("chaque vrai stand a l'adresse où le pro reçoit lui-même les demandes", () => {
  for (const p of PRESTATAIRES.filter((x) => !x.exemple)) {
    assert.match(p.email || "", /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i, `stand ${p.slug} : adresse manquante ou illisible`);
    assert.notEqual(p.email, SALON.email, `stand ${p.slug} : les demandes doivent aller au pro, pas au salon`);
  }
});

test("les adresses des stands sont uniques", () => {
  const vus = new Set();
  for (const p of PRESTATAIRES) {
    assert.ok(!vus.has(p.slug), `adresse en double : ${p.slug}`);
    vus.add(p.slug);
  }
});

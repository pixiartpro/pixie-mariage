// Tests de la grille des exposants : elle doit coller à /partenaires/ et au brouillon de contrat.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "../lib/tarifs.js";

test("les montants de la grille publique", () => {
  assert.equal(T.devis({ formule: "stand" }).premiere, 700);
  assert.equal(T.devis({ formule: "mesure" }).premiere, 800);
  assert.equal(T.devis({ formule: "stand", fondateur: true }).premiere, 650);
  assert.equal(T.devis({ formule: "mesure", fondateur: true }).premiere, 750);
  assert.equal(T.devis({ formule: "videaste" }).premiere, 200);
  assert.equal(T.devis({ formule: "videaste", fondateur: true }).premiere, 150);
  assert.equal(T.devis({ formule: "stand", partenaire: true }).premiere, 1390);
  assert.equal(T.devis({ formule: "stand", fondateur: true }).apresFondateur, 200);
  assert.equal(T.devis({ formule: "inconnue" }).formule.key, "stand");
});

test("TVA de La Réunion 8,5 %", () => {
  assert.equal(T.ttc(700), 759.5);
  assert.equal(T.ttc(650), 705.25);
});

test("contrôle du SIRET", () => {
  assert.equal(T.siretValide("980 951 065 00013"), true); // PIX-I-ART
  assert.equal(T.siretValide("98095106500014"), false);
  assert.equal(T.siretValide("00000000000000"), false);
  assert.equal(T.siretValide("1234"), false);
  assert.equal(T.siretValide(null), false);
});

// Tests de la demande de devis précise (date, commune, invités) gardée sur l'appareil du couple.
import { test } from "node:test";
import assert from "node:assert/strict";

const magasin = new Map();
globalThis.localStorage = { getItem: (k) => (magasin.has(k) ? magasin.get(k) : null), setItem: (k, v) => magasin.set(k, String(v)), removeItem: (k) => magasin.delete(k) };
const P = await import("../lib/projet.js");

test("le projet abîmé ou vide ne casse rien", () => {
  localStorage.setItem("pm:projet", "{pas du json");
  assert.deepEqual(P.lireProjet(), { date: "", commune: "", invites: "" });
  localStorage.setItem("pm:projet", JSON.stringify({ date: "12/12/2026", commune: 4, invites: "120 personnes" }));
  assert.deepEqual(P.lireProjet(), { date: "", commune: "", invites: "120" });
});

test("le mail de devis part chez le pro, avec la date en français, la commune et les invités", () => {
  const m = decodeURIComponent(P.mailDevis("bonjour@fleurs-de-corail.re", { date: "2026-12-12", commune: "Saint-Paul", invites: "120" }));
  assert.match(m, /^mailto:bonjour@fleurs-de-corail\.re\?subject=Demande via Pixie Mariage — mariage le 12\/12\/2026&/);
  assert.match(m, /J'ai découvert votre stand sur Pixie Mariage/);
  assert.match(m, /Date du mariage : 12\/12\/2026/);
  assert.match(m, /Commune : Saint-Paul/);
  assert.match(m, /environ 120/);
  assert.doesNotMatch(m, /mis·e en relation|contact@pix-i-art/);
});

test("sans projet, le mail le dit simplement et l'objet reste reconnaissable", () => {
  const m = decodeURIComponent(P.mailDevis("a@b.re", { date: "", commune: "", invites: "" }));
  assert.match(m, /subject=Demande via Pixie Mariage&/);
  assert.doesNotMatch(m, /Date du mariage|Commune :|invités/);
  assert.doesNotMatch(m, /\n\n\n/);
});

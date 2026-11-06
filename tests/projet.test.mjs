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

test("le mail de devis contient la date en français, la commune et les invités", () => {
  const m = decodeURIComponent(P.mailDevis("contact@pix-i-art.re", "Fleurs de Corail", "Fleuristes", "Saint-Leu", { date: "2026-12-12", commune: "Saint-Paul", invites: "120" }));
  assert.match(m, /^mailto:contact@pix-i-art\.re\?subject=Demande de contact — Fleurs de Corail/);
  assert.match(m, /Date du mariage : 12\/12\/2026/);
  assert.match(m, /Commune : Saint-Paul/);
  assert.match(m, /environ 120/);
});

test("sans projet, le mail le dit simplement", () => {
  const m = decodeURIComponent(P.mailDevis("a@b.re", "X", "Y", "Z", { date: "", commune: "", invites: "" }));
  assert.match(m, /pas encore fixée/);
  assert.doesNotMatch(m, /Commune :|invités/);
});

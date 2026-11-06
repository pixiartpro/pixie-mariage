// Tests de « Ma sélection » avec un faux navigateur (localStorage + événements).
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const magasin = new Map();
globalThis.localStorage = { getItem: (k) => (magasin.has(k) ? magasin.get(k) : null), setItem: (k, v) => magasin.set(k, String(v)), removeItem: (k) => magasin.delete(k) };
const ecouteurs = {};
globalThis.window = { addEventListener: (e, f) => (ecouteurs[e] = f), removeEventListener: () => {}, dispatchEvent: (ev) => ecouteurs[ev.type]?.() };
globalThis.Event = class { constructor(t) { this.type = t; } };

const S = await import("../lib/selection.js");
const { PRESTATAIRES } = await import("../lib/data.js");
const a = PRESTATAIRES[0].slug, b = PRESTATAIRES[1].slug;

beforeEach(() => magasin.clear());

test("le cœur met de côté et retire", () => {
  S.basculer(a);
  assert.equal(S.estChoisi(a), true);
  S.basculer(a);
  assert.equal(S.estChoisi(a), false);
});

test("un stand inconnu ou une liste abîmée ne cassent rien", () => {
  localStorage.setItem("pm:selection", "pas du json");
  assert.deepEqual(S.lireSelection(), []);
  localStorage.setItem("pm:selection", JSON.stringify([{ slug: "inconnu" }, null, { slug: a }]));
  assert.deepEqual(S.lireSelection().map((x) => x.slug), [a]);
});

test("le lien partagé : sans doublon, sans inconnu, 30 au plus", () => {
  assert.deepEqual(S.slugsDuLien(`${a},${a},inconnu, ${b}`), [a, b]);
  assert.equal(S.slugsDuLien(Array(50).fill(a).join(",")).length, 1);
  S.basculer(a);
  assert.equal(S.ajouterPlusieurs([a, b]), 1);
});

test("la note est coupée à 200 caractères", () => {
  S.basculer(a);
  S.noter(a, "x".repeat(500));
  assert.equal(S.lireSelection()[0].note.length, 200);
});

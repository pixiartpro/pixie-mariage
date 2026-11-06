// Tests du mode essai de l'appli (sans base) : créer, lire avec le code, modifier avec la version, effacer.
import { test } from "node:test";
import assert from "node:assert/strict";

const magasin = new Map();
globalThis.localStorage = { getItem: (k) => (magasin.has(k) ? magasin.get(k) : null), setItem: (k, v) => magasin.set(k, String(v)), removeItem: (k) => magasin.delete(k) };
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
const S = await import("../lib/appli/stockage.js");

test("le site tourne en mode essai tant que la base n'est pas branchée", () => assert.equal(S.MODE, "essai"));

test("le parcours complet des mariés et des invités", async () => {
  const r = await S.creerMariage({ prenoms: ["Léa", "Mathis"], date: "2026-12-12", lieu: { nom: "Domaine" } });
  assert.match(r.slug, /^lea-mathis-[a-z0-9]{6}$/);
  assert.match(r.code, /^[A-Z0-9]{6}$/);
  assert.equal(await S.lireMariage(r.slug, "FAUX00"), null);
  assert.equal((await S.lireMariage(r.slug, r.code.toLowerCase())).contenu.prenoms[0], "Léa");
  assert.equal(await S.ouvrirMariage(r.slug, "mauvaise-cle"), null);
  const o = await S.ouvrirMariage(r.slug, r.cle);
  const v2 = await S.modifierMariage(r.slug, r.cle, { ...o.contenu, conseil: "Crème solaire" }, o.version);
  await assert.rejects(S.modifierMariage(r.slug, r.cle, o.contenu, o.version), /entre-temps/);
  await S.modifierMariage(r.slug, r.cle, o.contenu, v2);
  await S.annoncer(r.slug, r.cle, "  Sous le kiosque  ");
  assert.equal((await S.lireMariage(r.slug, r.code)).annonce, "Sous le kiosque");
  const code2 = await S.nouveauCode(r.slug, r.cle);
  assert.equal(await S.lireMariage(r.slug, r.code), null);
  assert.ok(await S.lireMariage(r.slug, code2));
  await S.supprimerMariage(r.slug, r.cle);
  assert.equal(await S.lireMariage(r.slug, code2), null);
});

test("la démo s'ouvre sans code", async () => {
  const d = await S.lireMariage("demo", "");
  assert.equal(d.demo, true);
  assert.equal(d.contenu.prenoms.join(" & "), "Léa & Mathis");
});

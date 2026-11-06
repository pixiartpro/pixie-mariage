// Tests du calcul pur de l'appli du mariage (heure de La Réunion, nettoyage, liens, agenda).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as C from "../lib/appli/contenu.js";

const t = (iso) => Date.parse(iso);
const prog = [{ heure: "15:30" }, { heure: "16:00" }, { heure: "22:00" }, { heure: "00:30" }];

test("la phase suit l'heure de La Réunion (UTC+4) et la nuit compte jusqu'à 6 h", () => {
  assert.equal(C.phase("2026-12-12", t("2026-12-11T19:59:00Z")), "avant");
  assert.equal(C.phase("2026-12-12", t("2026-12-11T20:00:00Z")), "jour");
  assert.equal(C.phase("2026-12-12", t("2026-12-13T01:59:00Z")), "jour");
  assert.equal(C.phase("2026-12-12", t("2026-12-13T02:00:00Z")), "apres");
  assert.equal(C.phase("", t("2026-12-13T02:00:00Z")), "avant");
});

test("le compte à rebours est en jours de La Réunion", () => {
  assert.equal(C.joursRestants("2026-12-12", t("2026-11-06T02:00:00Z")), 36);
  assert.equal(C.joursRestants("2026-12-12", t("2026-12-11T20:30:00Z")), 0);
});

test("le moment en cours, y compris après minuit", () => {
  assert.equal(C.momentEnCours(prog, "2026-12-12", t("2026-12-12T10:00:00Z")), -1);
  assert.equal(C.momentEnCours(prog, "2026-12-12", t("2026-12-12T12:10:00Z")), 1);
  assert.equal(C.momentEnCours(prog, "2026-12-12", t("2026-12-12T19:00:00Z")), 2);
  assert.equal(C.momentEnCours(prog, "2026-12-12", t("2026-12-12T21:00:00Z")), 3);
  assert.equal(C.momentEnCours(prog, "2026-12-12", t("2026-12-10T21:00:00Z")), null);
});

test("seuls les liens https passent", () => {
  assert.equal(C.lienSur("javascript:alert(1)"), "");
  assert.equal(C.lienSur("data:text/html,x"), "");
  assert.equal(C.lienSur("http://x.fr"), "");
  assert.equal(C.lienSur(" https://x.fr/a "), "https://x.fr/a");
  assert.deepEqual(C.liensRefuses({ reponse: { lien: "www.x.fr" }, apres: {}, prestataires: [] }), ["le formulaire de réponse"]);
});

test("les dates écrites avec leur jour juste", () => {
  assert.equal(C.dateLisible("2026-12-12"), "Samedi 12 décembre 2026");
  assert.equal(C.dateLisible("2026-11-21"), "Samedi 21 novembre 2026");
  assert.equal(C.dateLisible("2026-11-06"), "Vendredi 6 novembre 2026");
});

test("nettoyer jette l'inconnu, coupe les textes, refuse le 30 février", () => {
  const n = C.nettoyer({
    prenoms: ["A".repeat(99)],
    date: "2026-02-30",
    programme: [{ heure: "25:00", titre: "x" }],
    prestataires: [{ slug: "Bad Slug!" }, { nom: "" }, { slug: "ok-1", role: "r" }],
    pirate: 1,
  });
  assert.equal(n.pirate, undefined);
  assert.equal(n.prenoms[0].length, C.LIMITES.prenom);
  assert.equal(n.prenoms[1], "");
  assert.equal(n.date, "");
  assert.equal(n.programme[0].heure, "");
  assert.deepEqual(n.prestataires.filter((p) => p.slug), [{ slug: "ok-1", role: "r" }]);
  assert.equal(C.nettoyer(null).v, C.VERSION);
});

test("le fichier agenda part à la première heure du programme, en UTC", () => {
  const ics = C.fichierAgenda({ ...C.mariageVide(), prenoms: ["Léa", "Mathis"], date: "2026-12-12", lieu: { nom: "Domaine, Saint-Paul", ville: "", adresse: "" } }, "https://x");
  assert.match(ics, /DTSTART:20261212T113000Z/);
  assert.match(ics, /LOCATION:Domaine\\, Saint-Paul/);
});

test("le message aux invités : prénoms, date, lien avec le code", () => {
  const m = C.messageInvites(["Sarah", "Kévin"], "2026-12-19", "https://x/mariage/?m=s#c=ABC123");
  assert.match(m, /^Sarah & Kévin se marient le samedi 19 décembre 2026 !/);
  assert.match(m, /les souvenirs : tout est ici, sans appli à installer/);
  assert.ok(m.endsWith("https://x/mariage/?m=s#c=ABC123"));
  assert.match(C.messageInvites(["A", "B"], "", "L"), /^A & B se marient ! /);
});

test("chaque question pratique préremplie a son exemple", () => {
  for (const i of C.mariageVide().infos) assert.ok(C.EXEMPLES_INFOS[i.titre], `exemple manquant : ${i.titre}`);
});

test("le signalement d'un contenu : un mail prérempli, sans jamais le code du faire-part", () => {
  const l = decodeURIComponent(C.lienSignalement("contact@pix-i-art.re", "https://exemple.re/mariage/?m=lea-mathis-abc123"));
  assert.match(l, /^mailto:contact@pix-i-art\.re\?subject=Signalement d'un contenu — Pixie Mariage&body=/);
  assert.match(l, /Adresse de la page : https:\/\/exemple\.re\/mariage\/\?m=lea-mathis-abc123/);
  assert.match(l, /de bonne foi/);
  assert.doesNotMatch(l, /#c=/);
});

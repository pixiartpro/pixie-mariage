// L'espace pro (démonstration du samedi 21/11/2026 à Nordev) : l'agenda, les demandes, les mariages,
// et le lien avec l'appli des mariés. Le calcul est pur : on le teste sans navigateur.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PRESTATAIRES } from "../lib/data.js";
import { MARIAGE_DEMO } from "../lib/appli/demo.js";
import { PRO_DEMO, etatDemoPro } from "../lib/appli/demo-pro.js";
import {
  grilleMois,
  moisSuivant,
  estSamedi,
  etatJour,
  dispo,
  basculerLibre,
  samedisACocher,
  cocherSamedis,
  changerEtape,
  ETAPES,
  resume,
  ilYa,
  deCouple,
  messageOffrirAppli,
  decaler,
} from "../lib/appli/pro.js";
import sitemap from "../app/sitemap.js";

const AUJ = "2026-11-07"; // un samedi
const OUT = new URL("../out/", import.meta.url).pathname;

test("le calendrier commence le lundi et place chaque jour sous le bon jour de semaine", () => {
  const nov = grilleMois(2026, 11);
  assert.equal(nov.length, 6);
  assert.deepEqual(nov[0], [null, null, null, null, null, null, "2026-11-01"], "le 1er novembre 2026 est un dimanche");
  assert.equal(nov[5][0], "2026-11-30", "le 30 novembre 2026 est un lundi");
  assert.ok(nov.every((s) => s.length === 7));
  const fev = grilleMois(2027, 2).flat().filter(Boolean);
  assert.equal(fev.length, 28);
  assert.deepEqual(moisSuivant({ annee: 2026, mois: 12 }), { annee: 2027, mois: 1 });
  assert.deepEqual(moisSuivant({ annee: 2027, mois: 1 }, -1), { annee: 2026, mois: 12 });
  assert.ok(estSamedi("2026-11-07") && estSamedi("2026-12-12") && !estSamedi("2026-12-13"));
});

test("un jour est passé, réservé, libre ou pas coché ; un jour réservé ou passé ne se coche pas", () => {
  const e = etatDemoPro(AUJ);
  assert.equal(etatJour("2026-11-06", e, AUJ), "passe");
  assert.equal(etatJour("2026-12-12", e, AUJ), "reserve");
  assert.equal(etatJour("2026-11-28", e, AUJ), "libre");
  assert.equal(etatJour("2026-11-21", e, AUJ), "rien");
  assert.equal(etatJour("2026-11-21", basculerLibre(e, "2026-11-21", AUJ), AUJ), "libre");
  assert.equal(etatJour("2026-11-28", basculerLibre(e, "2026-11-28", AUJ), AUJ), "rien");
  assert.equal(basculerLibre(e, "2026-12-12", AUJ), e, "le jour du mariage de Léa & Mathis reste réservé");
  assert.equal(basculerLibre(e, "2026-11-06", AUJ), e, "hier ne se coche plus");
});

test("« libre tous les samedis » coche seulement les samedis encore ouverts du mois", () => {
  const e = etatDemoPro(AUJ);
  assert.deepEqual(samedisACocher(e, 2026, 11, AUJ), ["2026-11-07", "2026-11-14", "2026-11-21"], "le 28 est déjà coché");
  const apres = cocherSamedis(e, 2026, 12, AUJ);
  assert.ok(!apres.libres.includes("2026-12-12"), "le samedi du mariage de Léa & Mathis n'est pas coché libre");
  assert.equal(etatJour("2026-12-26", apres, AUJ), "libre");
  assert.deepEqual(samedisACocher(apres, 2026, 12, AUJ), []);
});

test("une demande dit tout de suite si le pro est libre ce jour-là", () => {
  const e = etatDemoPro(AUJ);
  const par = Object.fromEntries(e.demandes.map((d) => [d.id, dispo(d.date, e).etat]));
  assert.equal(par["anais-kevin"], "libre");
  assert.equal(par["melissa-johan"], "pris", "le 12/12/2026 est déjà le mariage de Léa & Mathis");
  assert.equal(par["chloe-dylan"], "inconnu");
});

test("« Réservé » crée le mariage et prend la date ; deux mariages le même jour, c'est refusé", () => {
  const e = etatDemoPro(AUJ);
  const refus = changerEtape(e, "melissa-johan", "reserve", "Les photos");
  assert.equal(refus.etat, e);
  assert.equal(refus.erreur, "Ce jour-là, vous avez déjà le mariage de Léa & Mathis.");

  const avant = resume(e, AUJ);
  const ok = changerEtape(e, "anais-kevin", "reserve", "Les photos");
  assert.equal(ok.erreur, undefined);
  assert.equal(ok.mariage.date, "2027-01-16");
  assert.equal(ok.mariage.role, "Les photos");
  assert.equal(etatJour("2027-01-16", ok.etat, AUJ), "reserve");
  assert.equal(resume(ok.etat, AUJ).libres, avant.libres - 1);
  assert.equal(resume(ok.etat, AUJ).nouvelles, avant.nouvelles - 1);

  // On revient en arrière : le mariage disparaît, et le jour redevient libre tout seul.
  const retour = changerEtape(ok.etat, "anais-kevin", "devis");
  assert.equal(retour.etat.mariages.length, e.mariages.length);
  assert.equal(etatJour("2027-01-16", retour.etat, AUJ), "libre");
  assert.ok(changerEtape(e, "inconnue", "reserve").erreur);
  assert.ok(changerEtape(e, "anais-kevin", "n-importe-quoi").erreur);
});

test("les mots du quotidien : « hier », « d'Anaïs », le message pour offrir l'appli", () => {
  assert.equal(ilYa(AUJ, AUJ), "aujourd'hui");
  assert.equal(ilYa(decaler(AUJ, -1), AUJ), "hier");
  assert.equal(ilYa(decaler(AUJ, -9), AUJ), "il y a 9 jours");
  assert.equal(deCouple({ prenoms: ["Anaïs", "Kévin"] }), "d'Anaïs & Kévin");
  assert.equal(deCouple({ prenoms: ["Émilie", "Thomas"] }), "d'Émilie & Thomas");
  assert.equal(deCouple({ prenoms: ["Léa", "Mathis"] }), "de Léa & Mathis");
  const msg = messageOffrirAppli(["Émilie", "Thomas"], "Lumière Australe Studio", "https://exemple.org/appli-du-mariage/");
  assert.match(msg, /^Bonjour Émilie et Thomas,/);
  assert.ok(msg.includes("https://exemple.org/appli-du-mariage/") && msg.endsWith("Lumière Australe Studio"));
});

test("la démo reste inventée de bout en bout, et reliée au mariage de démonstration de l'appli des mariés", () => {
  const fiche = PRESTATAIRES.find((p) => p.slug === PRO_DEMO.stand);
  assert.ok(fiche, "le stand de la démo existe");
  assert.equal(fiche.exemple, true, "jamais la démo sur la fiche d'un vrai pro");
  const dansAppli = MARIAGE_DEMO.contenu.prestataires.find((p) => p.slug === PRO_DEMO.stand);
  assert.ok(dansAppli, "le pro de la démo figure dans l'appli de Léa & Mathis");
  assert.equal(dansAppli.role, PRO_DEMO.role);
  const relie = PRO_DEMO.mariages.find((m) => m.appli === "demo");
  assert.equal(relie.date, MARIAGE_DEMO.contenu.date);
  assert.deepEqual(relie.prenoms, MARIAGE_DEMO.contenu.prenoms);

  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const dates = [...PRO_DEMO.libres, ...PRO_DEMO.mariages.map((m) => m.date), ...PRO_DEMO.demandes.map((d) => d.date)];
  for (const d of dates) assert.ok(iso.test(d) && new Date(d + "T12:00:00Z").toISOString().startsWith(d), `date illisible : ${d}`);
  const ids = PRO_DEMO.demandes.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const d of PRO_DEMO.demandes) assert.ok(ETAPES.some((x) => x.cle === d.etape), `étape inconnue : ${d.etape}`);
  for (const d of etatDemoPro(AUJ).demandes) assert.ok(d.recue < AUJ || d.recue === AUJ);
});

test("la démo n'est ni dans le plan du site, ni ouverte aux moteurs de recherche", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  assert.ok(sitemap().every((u) => !u.url.includes("espace-pro")));
  const page = join(OUT, "espace-pro/index.html");
  assert.ok(existsSync(page), "/espace-pro/ est construite");
  assert.match(readFileSync(page, "utf8"), /<meta name="robots" content="noindex, nofollow"/);
});

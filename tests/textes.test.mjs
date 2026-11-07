// Des mots collés dans les phrases du site (« contact@pix-i-art.reavec », « 0clics », « Kévinn'ont »).
// Cause, vérifiée le samedi 07/11/2026 sur le compilateur de Next 16.2.9 (SWC) : quand un texte JSX suit une variable
// ({mail} avec l&apos;adresse…), contient une entité (&apos; &amp; …) et continue jusqu'au bout de la ligne,
// l'espace entre la variable et le texte disparaît à la construction. Sur une seule ligne fermée par une balise, il reste.
// Le remède : {mail}{" "}avec l&apos;adresse, ou la phrase entière en gabarit `${…}`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RACINE = new URL("../", import.meta.url).pathname;
const fichiers = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? fichiers(p) : n.endsWith(".js") ? [p] : [];
  });
// Une variable, un espace, puis un texte avec une entité qui file jusqu'au bout de la ligne.
const PIEGE = /\}[ \t]+[^<{}\n]*&(?:[a-z]+|#\d+);[^<{}\n]*$/;

test("aucune phrase ne colle un mot à la variable qui le précède", () => {
  const trouves = [];
  for (const f of [...fichiers(join(RACINE, "app")), ...fichiers(join(RACINE, "components"))]) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((ligne, i) => {
        if (!ligne.trim().startsWith("//") && PIEGE.test(ligne)) trouves.push(`${f.replace(RACINE, "")}:${i + 1}`);
      });
  }
  assert.deepEqual(trouves, [], "écrire {variable}{\" \"}texte, ou la phrase en gabarit `${…}`");
});

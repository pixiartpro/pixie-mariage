// Un stand fermé est gardé 24 mois, puis effacé : choix de Guillaume du dimanche 08/11/2026, écrit à l'article 10 du
// contrat de stand. Avant, le site promettait « jamais effacé » : une durée sans fin, que la loi sur les données
// personnelles n'admet pas, et que le contrat ne disait plus. Les règles du salon sont jointes au contrat (annexe 3) :
// elles doivent dire la même chose que lui.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ICI = (chemin) => new URL(`../${chemin}`, import.meta.url).pathname;
const OUT = ICI("out/");
const pages = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? pages(p) : n.endsWith(".html") ? [p] : [];
  });

test("les règles et la charte ne promettent plus qu'un stand n'est jamais effacé", () => {
  for (const f of ["app/(salon)/regles-du-salon/page.js", "components/Charte.js"]) {
    const s = readFileSync(ICI(f), "utf8");
    assert.doesNotMatch(s, /jamais effac/i, `${f} : un stand fermé est gardé 24 mois, puis effacé (contrat, article 10)`);
    assert.match(s, /gardé 24 mois/, `${f} doit dire la durée : 24 mois`);
  }
});

test("après construction : aucune page ne dit « jamais effacé », et les règles disent 24 mois", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const fautives = pages(OUT).filter((p) => /jamais effac/i.test(readFileSync(p, "utf8"))).map((p) => p.replace(OUT, ""));
  assert.deepEqual(fautives, [], "une page promet encore « jamais effacé »");
  assert.match(readFileSync(join(OUT, "regles-du-salon/index.html"), "utf8"), /gardé 24 mois/);
});

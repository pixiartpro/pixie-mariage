// Ce que le site promet sur le film doit tenir dans le contrat de stand (article 7, version du 08/11/2026) :
// PIX-I-ART cède à l'exposant, sans exclusivité, le droit d'utiliser le film partout pour sa promotion, et garde
// l'original (master), la signature et le droit de le montrer dans le salon et son portfolio. Le film n'« appartient »
// donc pas à l'exposant. La page des exposants le disait deux fois : corrigé le dimanche 08/11/2026, sur le modèle de
// la charte (« vous l'utilisez partout pour votre promotion »).
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

test("le texte des exposants ne dit plus que le film leur appartient", () => {
  for (const f of ["lib/data.js", "components/Charte.js", "app/(salon)/partenaires/page.js"]) {
    const s = readFileSync(ICI(f), "utf8");
    assert.doesNotMatch(s, /vous appartien/i, `${f} : le contrat cède un droit d'usage, il ne transfère pas la propriété du film`);
  }
  assert.match(readFileSync(ICI("lib/data.js"), "utf8"), /que vous utilisez partout pour votre promotion/);
});

test("après construction : aucune page ne dit « vous appartient »", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const fautives = pages(OUT).filter((p) => /vous appartien/i.test(readFileSync(p, "utf8"))).map((p) => p.replace(OUT, ""));
  assert.deepEqual(fautives, [], "une page promet encore que le film appartient à l'exposant");
  assert.match(readFileSync(join(OUT, "partenaires/index.html"), "utf8"), /utilisez partout pour votre promotion/);
});

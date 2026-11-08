// Le jour du déménagement sur Vercel, chaque ancienne adresse (pixiartpro.github.io/pixie-mariage/…) doit renvoyer
// vers la même page à la nouvelle adresse, en gardant « ?m=demo » : les QR déjà imprimés ne se corrigent pas.
// On exécute le vrai script de renvoi, comme le ferait le navigateur d'un téléphone qui vient de lire le QR.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import vm from "node:vm";
import { adresseDuSite, fabriquerRenvoi, scriptDeRenvoi } from "../scripts/renvoi-github.mjs";

const OUT = new URL("../out/", import.meta.url).pathname;
const QR = JSON.parse(readFileSync(new URL("../contenu/qr-imprimes.json", import.meta.url), "utf8")).qr;
const SITE = adresseDuSite();

function destination(script, pathname, search = "", hash = "") {
  let vers = null;
  vm.runInNewContext(script, { location: { pathname, search, hash, replace: (u) => { vers = u; } } });
  return vers;
}
const scriptDe = (html) => html.match(/<script>([\s\S]*?)<\/script>/)[1];

test("une ancienne adresse renvoie vers la même page, en gardant la recherche et l'ancre", () => {
  assert.ok(SITE.startsWith("https://") && !SITE.includes("github.io"), "la nouvelle adresse doit être celle du site, en https");
  const s = scriptDeRenvoi(SITE);
  assert.equal(destination(s, "/pixie-mariage/"), `${SITE}/`);
  assert.equal(destination(s, "/pixie-mariage"), `${SITE}/`);
  assert.equal(destination(s, "/pixie-mariage/annuaire/", "?cat=salles"), `${SITE}/annuaire/?cat=salles`);
  assert.equal(destination(s, "/pixie-mariage/mariage/", "?m=demo", "#programme"), `${SITE}/mariage/?m=demo#programme`);
  assert.equal(destination(s, "/pixie-mariage/ancienne-page/x"), `${SITE}/ancienne-page/x`);
  assert.equal(destination(s, "/pixie-mariagexyz/"), `${SITE}/pixie-mariagexyz/`, "seul le vrai préfixe /pixie-mariage est retiré");
});

test("après construction : chaque ancienne page a son renvoi, QR imprimés compris", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  const dossier = mkdtempSync(join(tmpdir(), "pm-renvoi-"));
  try {
    const pages = fabriquerRenvoi(dossier, OUT, SITE);
    assert.ok(pages.length > 20, `trop peu de pages de renvoi (${pages.length})`);
    for (const { page, recherche, document } of QR) {
      assert.ok(pages.includes(page), `le QR « ${document} » (${page}) n'a pas de page de renvoi`);
      const html = readFileSync(join(dossier, page, "index.html"), "utf8");
      assert.equal(destination(scriptDe(html), `/pixie-mariage${page}`, recherche), `${SITE}${page}${recherche}`, `le QR « ${document} » ne mènerait pas à la bonne page`);
      assert.ok(html.includes(`<link rel="canonical" href="${SITE}${page}">`), `${page} : Google doit savoir où vit la vraie page`);
      assert.ok(html.includes(`content="0; url=${SITE}${page}"`), `${page} : sans JavaScript, le renvoi doit marcher aussi`);
    }
    const p404 = readFileSync(join(dossier, "404.html"), "utf8");
    assert.equal(destination(scriptDe(p404), "/pixie-mariage/ancienne-page/"), `${SITE}/ancienne-page/`, "une adresse inconnue doit renvoyer aussi");
    assert.ok(existsSync(join(dossier, ".nojekyll")));
  } finally {
    rmSync(dossier, { recursive: true, force: true });
  }
});

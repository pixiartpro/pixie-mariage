// Le papier ne se corrige pas : chaque QR déjà imprimé doit toujours mener à une vraie page.
// Le jour où le site passe sur sa propre adresse, GitHub renvoie l'ancienne vers la nouvelle en gardant la page et le « ?m= »
// (vérifié le samedi 07/11/2026 sur Bootstrap, Jekyll et Mermaid). Il ne reste donc qu'une façon de casser un QR distribué :
// renommer ou retirer la page qu'il vise. Ce test l'empêche. Un nouveau document imprimé avec un QR = une ligne de plus ici.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;

// Les QR prêts pour le salon de Nordev (samedi 21/11/2026), décodés un par un le samedi 07/11/2026.
const IMPRIMES = [
  { page: "/partenaires/candidater/", document: "prospectus exposants A5" },
  { page: "/mariage/", document: "affiche de la démo de l'appli (?m=demo), et les faire-part des couples" },
  { page: "/regles-du-salon/", document: "feuille Pixie Mariage (QR et adresse écrite)" },
];

test("chaque page visée par un QR imprimé existe toujours", { skip: !existsSync(OUT) && "lancer npm run build d'abord" }, () => {
  for (const { page, document } of IMPRIMES) {
    assert.ok(existsSync(join(OUT, page, "index.html")), `${page} a disparu : le QR du document « ${document} » mènerait à une page vide`);
  }
});

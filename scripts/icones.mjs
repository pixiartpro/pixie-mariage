// Les icônes du site : seulement celles qu'il utilise, au lieu des 5 807 icônes de Tabler (878 Ko).
// Avec la police complète, un téléphone en 4G attendait plusieurs secondes, et les icônes
// s'affichaient d'abord en carrés vides (vu le dimanche 08/11/2026 sur la démo de l'espace pro).
//
// À lancer après avoir ajouté ou changé une icône dans le code :  npm run icones
// Le script relit app/, components/ et lib/, garde les icônes utilisées, puis écrit
// app/icones.css et app/polices/tabler-icones.woff2 (il faut python3 avec fontTools et brotli).
// tests/icones.test.mjs refuse une icône du code qui manquerait dans app/icones.css.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const TABLER = join(RACINE, "node_modules/@tabler/icons-webfont");
const DOSSIERS = ["app", "components", "lib"];
const CSS_SORTIE = join(RACINE, "app/icones.css");
const POLICE_SORTIE = join(RACINE, "app/polices/tabler-icones.woff2");

function fichiersSource(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) return fichiersSource(chemin);
    return /\.(js|jsx|mjs)$/.test(e.name) ? [chemin] : [];
  });
}

// Toutes les icônes de Tabler : nom → point de code (« ea60 » pour chevron-left).
export function catalogueTabler() {
  const css = readFileSync(join(TABLER, "dist/tabler-icons.min.css"), "utf8");
  const catalogue = new Map();
  for (const m of css.matchAll(/\.ti-([a-z0-9-]+):before\{content:"\\([0-9a-f]+)"\}/g)) catalogue.set(m[1], m[2]);
  return catalogue;
}

// Les icônes que le code peut afficher. On en garde trop plutôt que pas assez :
//  1. une classe écrite en entier : className="ti ti-heart" ;
//  2. une classe à compléter : `ti ti-chevron-${ouverte ? "up" : "down"}` ;
//  3. un nom d'icône seul entre guillemets : icon: "camera", ic: "gift", ICONS = ["star", …].
export function iconesUtilisees(catalogue = catalogueTabler()) {
  const vues = new Set();
  const garder = (nom) => catalogue.has(nom) && vues.add(nom);
  for (const fichier of DOSSIERS.flatMap((d) => fichiersSource(join(RACINE, d)))) {
    const source = readFileSync(fichier, "utf8");
    for (const m of source.matchAll(/\bti-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) garder(m[1]);
    for (const m of source.matchAll(/\bti-([a-z0-9-]+)-\$\{([^}]*)\}/g)) {
      for (const s of m[2].matchAll(/["'`]([a-z0-9-]+)["'`]/g)) garder(`${m[1]}-${s[1]}`);
    }
    for (const m of source.matchAll(/["'`]([a-z0-9]+(?:-[a-z0-9]+)*)["'`]/g)) garder(m[1]);
  }
  return [...vues].sort();
}

function fabriquer() {
  const catalogue = catalogueTabler();
  const noms = iconesUtilisees(catalogue);
  const version = JSON.parse(readFileSync(join(TABLER, "package.json"), "utf8")).version;

  mkdirSync(dirname(POLICE_SORTIE), { recursive: true });
  execFileSync("python3", [
    "-m", "fontTools.subset", join(TABLER, "dist/fonts/tabler-icons.ttf"),
    `--unicodes=${noms.map((n) => catalogue.get(n)).join(",")}`,
    "--flavor=woff2", "--no-hinting", "--layout-features=", `--output-file=${POLICE_SORTIE}`,
  ], { stdio: "inherit" });

  const regles = noms.map((n) => `.ti-${n}:before { content: "\\${catalogue.get(n)}"; }`);
  writeFileSync(CSS_SORTIE, `/* Les icônes du site : ${noms.length} icônes de Tabler Icons ${version} (licence MIT, tabler.io), au lieu de ${catalogue.size}.
   Fichier fabriqué par scripts/icones.mjs : ne pas le modifier à la main, relancer « npm run icones ». */
@font-face {
  font-family: "tabler-icons";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("./polices/tabler-icones.woff2") format("woff2");
}
.ti { font-family: "tabler-icons" !important; speak: none; font-style: normal; font-weight: normal; font-variant: normal; text-transform: none; line-height: 1; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
${regles.join("\n")}
`);
  console.log(`${noms.length} icônes gardées sur ${catalogue.size} · police ${Math.round(statSync(POLICE_SORTIE).size / 1024)} Ko`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) fabriquer();

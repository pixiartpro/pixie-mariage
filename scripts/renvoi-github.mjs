// Les anciennes adresses (pixiartpro.github.io/pixie-mariage/…) renvoient vers le site à sa nouvelle adresse,
// en gardant la page, la recherche (« ?m=demo ») et l'ancre : les QR déjà imprimés et les liens déjà envoyés
// mènent toujours au bon endroit.
// GitHub Pages ne sait pas renvoyer côté serveur. Chaque ancienne page devient donc une petite page qui renvoie aussitôt,
// et qui dit à Google où vit la vraie page (canonical). Une adresse inconnue passe par 404.html, qui renvoie aussi.
// Usage : npm run build, puis npm run renvoi → dossier renvoi/.
// Ce dossier ne part sur GitHub Pages que sur le oui de Guillaume, APRÈS la première mise en ligne sur Vercel :
// sh scripts/publier-renvoi.sh
import { readdirSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ANCIEN_PREFIXE = "/pixie-mariage";

export function adresseDuSite() {
  return readFileSync(join(RACINE, "lib/chemin.js"), "utf8").match(/^export const SITE = "([^"]+)";$/m)[1];
}

// Les pages du site construit, en chemins d'adresse : « / », « /annuaire/ », « /partenaires/candidater/ »…
export function pagesDuSite(out = join(RACINE, "out")) {
  const pages = [];
  const parcourir = (dossier, chemin) => {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
      if (e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith(".")) parcourir(join(dossier, e.name), `${chemin}${e.name}/`);
      else if (e.name === "index.html") pages.push(chemin);
    }
  };
  parcourir(out, "/");
  return pages.sort();
}

// Le script qui renvoie : retire l'ancien préfixe, garde la page, la recherche et l'ancre.
export function scriptDeRenvoi(site) {
  return `var c=location.pathname.replace(/^\\/pixie-mariage(?=\\/|$)/,"")||"/";location.replace(${JSON.stringify(site)}+c+location.search+location.hash);`;
}

const echapper = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Sans JavaScript, le renvoi « meta refresh » mène à la bonne page (sans la recherche ni l'ancre).
export function pageDeRenvoi(site, chemin) {
  const cible = echapper(site + chemin);
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Pixie Mariage a déménagé</title>
<link rel="canonical" href="${cible}">
<meta http-equiv="refresh" content="0; url=${cible}">
<script>${scriptDeRenvoi(site)}</script>
</head>
<body><p>Pixie Mariage a déménagé : <a href="${cible}">${cible}</a></p></body>
</html>
`;
}

export function fabriquerRenvoi(sortie = join(RACINE, "renvoi"), out = join(RACINE, "out"), site = adresseDuSite()) {
  if (!existsSync(join(out, "index.html"))) throw new Error("lancer npm run build d'abord");
  rmSync(sortie, { recursive: true, force: true });
  const pages = pagesDuSite(out);
  for (const chemin of pages) {
    mkdirSync(join(sortie, chemin), { recursive: true });
    writeFileSync(join(sortie, chemin, "index.html"), pageDeRenvoi(site, chemin));
  }
  // Toute autre ancienne adresse : GitHub Pages sert 404.html, qui renvoie aussi (vers l'accueil sans JavaScript).
  writeFileSync(join(sortie, "404.html"), pageDeRenvoi(site, "/"));
  writeFileSync(join(sortie, ".nojekyll"), "");
  return pages;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const site = adresseDuSite();
  const pages = fabriquerRenvoi();
  console.log(`renvoi/ : ${pages.length} anciennes pages renvoient vers ${site}, plus 404.html pour les autres adresses`);
}

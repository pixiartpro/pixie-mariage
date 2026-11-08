import { execSync } from "node:child_process";

// Le site vit à la racine de sa propre adresse (SITE, dans lib/chemin.js), servi par Vercel depuis le dossier out/.
// Plus de sous-dossier /pixie-mariage comme sur pixiartpro.github.io : les anciennes pages y renvoient (scripts/renvoi-github.mjs).
// Le numéro de construction est l'enregistrement git construit : deux constructions du même enregistrement, sur le Mac
// et chez Vercel, donnent les mêmes fichiers octet pour octet. C'est ce que vérifie le contrôle « en ligne = dépôt ».
function enregistrement() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "hors-git";
  }
}
const CONSTRUCTION = enregistrement();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  generateBuildId: async () => CONSTRUCTION,
};

export default nextConfig;

/** @type {import('next').NextConfig} */
// Le site vit à la racine de sa propre adresse, pixie-mariage.re (même nom dans public/CNAME, lu par GitHub Pages).
// Plus de sous-dossier /pixie-mariage comme sur pixiartpro.github.io : GitHub renvoie l'ancienne adresse vers la nouvelle.
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

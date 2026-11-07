// robots.txt : possible depuis que le site vit à la racine de pixie-mariage.re. Il annonce le plan du site à Google.
// Les pages privées portent déjà « noindex » dans leurs métadonnées : on ne les bloque pas ici, pour que Google lise cette consigne.
import { SITE } from "../lib/chemin";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
  };
}

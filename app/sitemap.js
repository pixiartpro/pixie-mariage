// Le plan du site pour Google (sitemap.xml), annoncé dans robots.txt depuis que le site vit à la racine de sa propre adresse (SITE, lib/chemin.js).
// À déclarer aussi dans Google Search Console (propriété de la nouvelle adresse). Les pages privées (modifier, espace exposant, ma sélection) n'y sont pas.
import { PRESTATAIRES } from "../lib/data";
import { SITE } from "../lib/chemin";

export const dynamic = "force-static";

export default function sitemap() {
  const pages = ["", "annuaire/", "partenaires/", "partenaires/candidater/", "regles-du-salon/", "appli-du-mariage/", "appli-du-mariage/confidentialite/", "mentions-legales/"];
  return [
    ...pages.map((p) => ({ url: `${SITE}/${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 })),
    ...PRESTATAIRES.filter((p) => !p.exemple).map((p) => ({ url: `${SITE}/prestataire/${p.slug}/`, changeFrequency: "monthly", priority: 0.8 })),
  ];
}

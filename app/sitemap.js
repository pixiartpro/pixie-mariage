// Le plan du site pour Google (sitemap.xml). Sur pixiartpro.github.io, pas de robots.txt possible (il faudrait la racine du domaine) :
// ce plan se déclare à la main dans Google Search Console (propriété « préfixe d'URL »), en attendant un vrai domaine. Les pages privées (modifier, espace exposant, ma sélection) n'y sont pas.
import { PRESTATAIRES } from "../lib/data";
import { SITE } from "../lib/chemin";

export const dynamic = "force-static";

export default function sitemap() {
  const pages = ["", "annuaire/", "partenaires/", "regles-du-salon/", "appli-du-mariage/", "appli-du-mariage/confidentialite/"];
  return [
    ...pages.map((p) => ({ url: `${SITE}/${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 })),
    ...PRESTATAIRES.filter((p) => !p.exemple).map((p) => ({ url: `${SITE}/prestataire/${p.slug}/`, changeFrequency: "monthly", priority: 0.8 })),
  ];
}

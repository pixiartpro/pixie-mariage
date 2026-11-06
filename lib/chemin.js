// Le préfixe du site en ligne (GitHub Pages sert le site sous /pixie-mariage).
// À utiliser seulement là où Next ne l'ajoute pas tout seul (manifeste, icônes, liens absolus).
export const PREFIXE = process.env.NODE_ENV === "production" ? "/pixie-mariage" : "";
export const SITE = "https://pixiartpro.github.io/pixie-mariage";

// Aperçu de partage d'une page (WhatsApp, Facebook) : à poser dans metadata.openGraph.
export const OG_BASE = { type: "website", locale: "fr_FR", siteName: "Pixie Mariage" };
const ALT = { "og-salon": "Pixie Mariage, le salon du mariage de La Réunion", "og-appli": "L'appli du mariage : avant, le jour J, et après" };
// chemin : l'adresse de la page sans le domaine (« annuaire/ »), pour og:url.
export const apercu = (titre, description, image = "og-salon", chemin) => ({
  ...OG_BASE,
  title: titre,
  description,
  ...(chemin !== undefined ? { url: `${SITE}/${chemin}` } : {}),
  images: [{ url: `${PREFIXE}/og/${image}.png`, width: 1200, height: 630, alt: ALT[image] }],
});

// L'adresse du site : pixie-mariage.re, à la racine (le même nom est dans public/CNAME, pour GitHub Pages).
// PREFIXE reste vide : il servait quand GitHub Pages servait le site sous /pixie-mariage. On le garde pour
// les endroits où Next n'ajoute rien tout seul (manifeste, icônes, liens absolus), si un sous-dossier revenait.
export const PREFIXE = "";
export const SITE = "https://pixie-mariage.re";

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

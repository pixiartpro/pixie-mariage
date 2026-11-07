import localFont from "next/font/local";
// Icônes Tabler servies par le site lui-même, et seulement celles qu'il utilise (15 Ko au lieu de 878 Ko).
// Fabriquées par « npm run icones » à partir du paquet npm (version figée), sans CDN tiers.
import "./icones.css";
import "./globals.css";
import "./appli.css";
import { PREFIXE, SITE } from "../lib/chemin";
import donneesStructurees from "../contenu/donnees-structurees.json";

// Les deux polices du site sont rangées dans le dépôt (app/polices/, licence SIL OFL 1.1, voir LICENCES.txt) :
// la construction ne va plus les chercher chez Google Fonts (trois constructions ratées le dimanche 08/11/2026).
// Ce sont les fichiers que Google fournissait : sous-ensemble « latin », polices variables (une plage de graisses).
const cormorant = localFont({
  src: "./polices/cormorant-garamond-latin.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const jost = localFont({
  src: "./polices/jost-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-jost",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const viewport = { themeColor: "#FBF6F0" };

// Les aperçus de partage (WhatsApp, Facebook, Messenger) : titre, texte et image de chaque page.
export const metadata = {
  metadataBase: new URL(SITE),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Pixie Mariage",
    url: `${SITE}/`,
    title: "Pixie Mariage — le salon du mariage de La Réunion, ouvert toute l'année",
    description: "Les prestataires du mariage de l'île, en vidéo, au même endroit. Gratuit pour les couples.",
    images: [{ url: `${PREFIXE}/og/og-salon.png`, width: 1200, height: 630, alt: "Pixie Mariage, le salon du mariage de La Réunion" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: `${PREFIXE}/favicon.ico`, apple: `${PREFIXE}/icones/appli-180.png` },
  title: "Pixie Mariage — le salon du oui, toute l'année (La Réunion)",
  description:
    "Le salon du mariage en ligne de La Réunion : les prestataires de l'île en vidéo, toute l'année. Ma sélection à deux offerte, et bientôt l'appli du mariage.",
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        {/* Qui édite le site, pour les moteurs de recherche (données structurées, depuis la fiche du socle). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }} />
        {children}
      </body>
    </html>
  );
}

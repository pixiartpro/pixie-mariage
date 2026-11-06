import { Cormorant_Garamond, Jost } from "next/font/google";
// Icônes Tabler servies par le site lui-même (paquet npm, version figée), plus de CDN tiers.
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./globals.css";
import "./appli.css";
import { PREFIXE } from "../lib/chemin";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

// Les aperçus de partage (WhatsApp, Facebook, Messenger) : titre, texte et image de chaque page.
export const metadata = {
  metadataBase: new URL("https://pixiartpro.github.io"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Pixie Mariage",
    title: "Pixie Mariage — le salon du mariage de La Réunion, ouvert toute l'année",
    description: "Les prestataires du mariage de l'île, en vidéo, au même endroit. Gratuit pour les couples.",
    images: [{ url: `${PREFIXE}/og/og-salon.png`, width: 1200, height: 630, alt: "Pixie Mariage, le salon du mariage de La Réunion" }],
  },
  twitter: { card: "summary_large_image" },
  title: "Pixie Mariage — le salon du oui, toute l'année (La Réunion)",
  description:
    "Le salon du mariage 100 % en ligne à La Réunion : tous les prestataires (salles, traiteurs, photographes, fleuristes…) réunis au même endroit, en vidéo, toute l'année. Et un plan de table offert.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}

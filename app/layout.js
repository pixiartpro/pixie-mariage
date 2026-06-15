import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

export const metadata = {
  title: "Pixie Mariage — le salon du oui, toute l'année (La Réunion)",
  description:
    "Le salon du mariage 100 % en ligne à La Réunion : tous les prestataires (salles, traiteurs, photographes, fleuristes…) réunis au même endroit, en vidéo, toute l'année. Et un plan de table offert.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

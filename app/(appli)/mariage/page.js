import VueInvites from "../../../components/appli/VueInvites";
import { PREFIXE, apercu } from "../../../lib/chemin";

export const metadata = {
  title: "L'appli du mariage — Pixie Mariage",
  description: "Le lieu, le programme, le jour J et les souvenirs du mariage, au même endroit.",
  openGraph: apercu("L'appli du mariage", "Le lieu, le programme et les souvenirs du mariage, au même endroit.", "og-appli"),
  manifest: `${PREFIXE}/mariage.webmanifest`,
  appleWebApp: { capable: true, title: "Le mariage", statusBarStyle: "black-translucent" },
  icons: { icon: `${PREFIXE}/icones/appli-192.png`, apple: `${PREFIXE}/icones/appli-180.png` },
};

export default function PageMariage() {
  return <VueInvites />;
}

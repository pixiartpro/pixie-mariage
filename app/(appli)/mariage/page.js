import VueInvites from "../../../components/appli/VueInvites";
import { PREFIXE } from "../../../lib/chemin";

export const metadata = {
  title: "L'appli du mariage — Pixie Mariage",
  description: "Le lieu, le programme, le jour J et les souvenirs du mariage, au même endroit.",
  openGraph: {
    title: "L'appli du mariage",
    description: "Le lieu et le programme avant, le moment en cours le jour J, le film et les photos après. Pour vos invités, sans magasin d'applis.",
    images: [{ url: `${PREFIXE}/og/og-appli.png`, width: 1200, height: 630, alt: "L'appli du mariage : avant, le jour J, et après" }],
  },
  manifest: `${PREFIXE}/mariage.webmanifest`,
  appleWebApp: { capable: true, title: "Le mariage", statusBarStyle: "black-translucent" },
  icons: { icon: `${PREFIXE}/icones/appli-192.png`, apple: `${PREFIXE}/icones/appli-180.png` },
};

export default function PageMariage() {
  return <VueInvites />;
}

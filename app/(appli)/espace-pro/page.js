import EspacePro from "../../../components/appli/EspacePro";
import { apercu } from "../../../lib/chemin";

// La démonstration de l'outil des pros (agenda, demandes, mariages), pour le salon de Nordev du samedi 21/11/2026.
// Hors du plan du site et des moteurs de recherche : on la montre, on ne la publie pas comme un service qui existe.
export const metadata = {
  title: "Espace pro, démonstration — Pixie Mariage",
  description: "L'outil des pros du mariage : l'agenda, les demandes des couples et les mariages, reliés à l'appli des mariés. Démonstration, tout est inventé.",
  robots: { index: false, follow: false },
  openGraph: apercu("L'espace pro, en démonstration", "L'agenda, les demandes des couples et les mariages, au même endroit et reliés à l'appli des mariés.", "og-salon", "espace-pro/"),
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1411" },
  ],
};

export default function PageEspacePro() {
  return <EspacePro />;
}

import { apercu } from "../../../lib/chemin";
import AnnuaireClient from "../../../components/AnnuaireClient";
import StudioOrganisateur from "../../../components/StudioOrganisateur";

export const metadata = {
  openGraph: apercu("Les stands du salon — Pixie Mariage", "Tous les prestataires du mariage à La Réunion, en vidéo, toute l'année."),
  title: "Les stands du salon — Pixie Mariage",
  description:
    "Découvrez tous les prestataires du mariage à La Réunion : salles, traiteurs, photographes, vidéastes, fleuristes, musique, wedding planners, déco, pâtisserie, beauté, tenues, voitures. Chaque stand en vidéo, toute l'année.",
};

export default function AnnuairePage() {
  return (
    <>
      <AnnuaireClient />
      <StudioOrganisateur />
    </>
  );
}

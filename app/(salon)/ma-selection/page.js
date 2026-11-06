import MaSelection from "../../../components/MaSelection";
import { apercu } from "../../../lib/chemin";

export const metadata = {
  title: "Ma sélection — Pixie Mariage",
  description: "Les stands que vous avez mis de côté, à comparer et à partager à deux.",
  robots: { index: false, follow: true },
  // L'aperçu reste générique : jamais la liste des stands dans l'aperçu.
  openGraph: apercu("Notre sélection de prestataires — Pixie Mariage", "Les stands mis de côté pour le mariage. Ouvrez-les et ajoutez-les à votre sélection."),
};

export default function PageMaSelection() {
  return (
    <section className="section tight">
      <div className="container ed-conteneur">
        <p className="eyebrow">À deux, à votre rythme</p>
        <h1 className="section-title">Ma sélection</h1>
        <MaSelection />
      </div>
    </section>
  );
}

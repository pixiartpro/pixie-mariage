import Candidature from "../../../../components/Candidature";
import { apercu, SITE } from "../../../../lib/chemin";

export const metadata = {
  title: "Candidater comme exposant — Pixie Mariage",
  description: "Votre formule et votre prix en un clic, les 3 pièces à préparer, et votre demande prête à envoyer. Sans engagement.",
  openGraph: apercu("Exposez au salon du mariage — Pixie Mariage", "Votre prix tout de suite, tarif fondateur compris. Une candidature n'engage à rien.", "og-salon", "partenaires/candidater/"),
  alternates: { canonical: `${SITE}/partenaires/candidater/` },
};

export default function Candidater() {
  return (
    <section className="section tight">
      <div className="container ed-conteneur">
        <p className="eyebrow">Devenir exposant</p>
        <h1 className="section-title">Votre stand, votre prix, en trois étapes</h1>
        <p className="section-sub">La grille est la même pour tous, et publique, tarif fondateur compris. Une candidature n&apos;engage à rien.</p>
        <Candidature />
      </div>
    </section>
  );
}

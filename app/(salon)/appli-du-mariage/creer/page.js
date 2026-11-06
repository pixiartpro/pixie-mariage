import { CreerAppli } from "../../../../components/appli/EspaceMaries";

export const metadata = {
  title: "Créer l'appli de notre mariage — Pixie Mariage",
  description: "Remplissez ce que vos invités doivent savoir : l'appli est prête en quelques minutes, gratuite.",
};

export default function Creer() {
  return (
    <section className="section tight">
      <div className="container ed-conteneur">
        <p className="eyebrow">L&apos;appli du mariage</p>
        <h1 className="section-title">Créer l&apos;appli de notre mariage</h1>
        <p className="section-sub">Gratuite, pour vos invités : avant, le jour J et après.</p>
        <CreerAppli />
      </div>
    </section>
  );
}

import { ModifierAppli } from "../../../../components/appli/EspaceMaries";

export const metadata = {
  title: "Modifier notre appli — Pixie Mariage",
  robots: { index: false, follow: false },
};

export default function Modifier() {
  return (
    <section className="section tight">
      <div className="container ed-conteneur">
        <p className="eyebrow">L&apos;appli du mariage · espace des mariés</p>
        <h1 className="section-title">Notre appli</h1>
        <ModifierAppli />
      </div>
    </section>
  );
}

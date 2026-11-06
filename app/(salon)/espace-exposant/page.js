import EspaceExposant from "../../../components/appli/EspaceExposant";

export const metadata = {
  title: "Espace exposant — Pixie Mariage",
  description: "Les chiffres de votre stand : fiches vues, clics sur le contact, mariages qui vous citent.",
  robots: { index: false, follow: false },
};

export default function PageEspaceExposant() {
  return (
    <section className="section tight">
      <div className="container ed-conteneur">
        <p className="eyebrow">Pour les exposants</p>
        <h1 className="section-title">Votre espace exposant</h1>
        <p className="section-sub">Ce que votre stand a produit, sans promesse et sans mystère.</p>
        <EspaceExposant />
      </div>
    </section>
  );
}

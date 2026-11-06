import AfficheMariage from "../../../../components/appli/AfficheMariage";

export const metadata = {
  title: "L'affiche de l'appli du mariage — Pixie Mariage",
  robots: { index: false, follow: false },
};

export default function Affiche() {
  return (
    <section className="section tight">
      <div className="container imprimable-ecran">
        <AfficheMariage />
      </div>
    </section>
  );
}

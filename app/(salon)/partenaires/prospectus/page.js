import Link from "next/link";
import Charte from "../../../../components/Charte";
import ImprimerQr from "../../../../components/ImprimerQr";
import BoutonImprimer from "../../../../components/BoutonImprimer";

export const metadata = {
  title: "Prospectus exposants — Pixie Mariage",
  robots: { index: false, follow: false },
};

// Une page A5 à imprimer et à distribuer de la main à la main (salon de Nordev, visites).
export default function Prospectus() {
  return (
    <section className="section tight">
      <div className="container imprimable-ecran">
        <p className="no-print ed-aide" style={{ textAlign: "center", marginBottom: 14 }}>
          Format A5. <BoutonImprimer /> · <Link href="/partenaires/">Retour</Link>
        </p>
        <article className="feuille-a5">
          <p className="eyebrow">Pixie Mariage · La Réunion</p>
          <h1>Votre stand filmé, en ligne toute l&apos;année</h1>
          <p className="feuille-lead">Le salon du mariage qui ne ferme jamais. Un film tourné chez vous, que vous diffusez partout pour votre promotion, et votre stand au salon.</p>
          <div className="feuille-prix">
            <div><b>700 € HT</b><span>le stand filmé, 1ʳᵉ année comprise</span></div>
            <div><b>650 € HT</b><span>pour les 10 premiers (tarif fondateur)</span></div>
            <div><b>200 € HT / an</b><span>ensuite, pour rester (150 € HT les années 2 et 3 pour les fondateurs)</span></div>
            <div><b>Vidéastes</b><span>200 € HT / an : votre stand montre vos propres films</span></div>
          </div>
          <Charte lien={false} />
          <div className="feuille-pied">
            <ImprimerQr chemin="/partenaires/candidater/" taille={110} label="QR code vers la candidature exposant" />
            <p>
              <b>Votre prix en 1 minute, sans engagement</b>
              Scannez, choisissez votre formule, envoyez votre demande.
              <span>contact@pix-i-art.re · PIX-I-ART, Sainte-Clotilde</span>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

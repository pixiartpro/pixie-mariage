import { SALON, PARTENAIRES } from "../../lib/data";

export const metadata = {
  title: "Devenir exposant — Pixie Mariage",
  description: PARTENAIRES.heroTexte.slice(0, 150),
};

const ICONS = ["calendar-heart", "video", "users-group", "id-badge-2"];

export default function Partenaires() {
  const mailto = `mailto:${SALON.email}?subject=${encodeURIComponent(
    "Devenir exposant Pixie Mariage"
  )}&body=${encodeURIComponent(
    "Bonjour,\n\nJe suis prestataire (catégorie : ...) et je souhaite prendre un stand sur Pixie Mariage.\n\nNom de l'entreprise :\nVille :\nSite / réseaux :\n\nMerci !"
  )}`;

  return (
    <>
      <section className="partner-hero">
        <div className="container">
          <span className="kicker">Prestataires événementiels · La Réunion</span>
          <h1>{PARTENAIRES.heroTitre}</h1>
          <p>{PARTENAIRES.heroTexte}</p>
          <a href={mailto} className="btn btn-gold">
            {PARTENAIRES.cta} <i className="ti ti-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">pourquoi nous rejoindre</div>
          <h2 className="section-title">Votre vitrine qui travaille toute l&apos;année</h2>
          <div className="avantages" style={{ marginTop: 30 }}>
            {PARTENAIRES.avantages.map((a, i) => (
              <div className="avantage" key={i}>
                <div className="ic"><i className={`ti ti-${ICONS[i] || "star"}`} aria-hidden="true" /></div>
                <h3>{a.titre}</h3>
                <p>{a.texte}</p>
              </div>
            ))}
          </div>

          <div className="offre-box">
            <p>{PARTENAIRES.offre}</p>
          </div>

          <div style={{ textAlign: "center", marginTop: 34 }}>
            <a href={mailto} className="btn btn-rose">
              <i className="ti ti-mail" aria-hidden="true" /> {PARTENAIRES.cta}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { SALON, PARTENAIRES } from "../../lib/data";

// Grille publique décidée par Guillaume le jeudi 05/11/2026 (carnet d'idées, lignes du 05/11/2026).
const PRIX = [
  { nom: "Le stand filmé", prix: "700 € HT", detail: "Visite, tournage en sortie groupée avec d'autres exposants de votre coin de l'île, film monté, stand en ligne et première année de présence comprise. Facturé en deux lignes : le film 500 € HT, la présence de la première année 200 € HT." },
  { nom: "La vidéo sur mesure", prix: "800 € HT", detail: "Le même film, tourné chez vous seul, à la date qui vous arrange. Première année de présence comprise." },
  { nom: "La présence annuelle", prix: "200 € HT / an", detail: "Votre place dans le salon à partir de la deuxième année, éditions du Salon comprises. Pour un vidéaste, dès la première année : son stand présente ses propres films." },
  { nom: "Le tarif fondateur", prix: "150 € HT / an", detail: "Pour les 10 premiers exposants : la présence à 150 € HT au lieu de 200 € HT, pendant 3 ans à compter de la signature, puis la grille publique. La date de fin est écrite dans votre fiche." },
  { nom: "Le partenaire du mois", prix: "690 € HT", detail: "Un portrait monté et l'encart du mois sur l'accueil, signalé « sponsorisé », dans un bloc séparé du classement. 12 par an, pas un de plus." },
];

const ETAPES = [
  { titre: "Vous nous écrivez", texte: "Le nom de votre entreprise, votre SIRET, votre commune et vos réseaux. Nous vous répondons par écrit." },
  { titre: "On vient vous voir", texte: "Nous vérifions vos trois pièces (SIRET, assurance professionnelle, pièce de votre métier) et vous signez la charte exposant." },
  { titre: "Le tournage", texte: "De mai à septembre, hors saison cyclonique, le même jour que d'autres exposants de votre coin de l'île." },
  { titre: "Votre stand ouvre", texte: "Le film est monté, votre stand est publié avec le badge « Visité par PIX-I-ART », et le film vous est remis." },
];

export const metadata = {
  title: "Devenir exposant — Pixie Mariage",
  description: PARTENAIRES.heroTexte.slice(0, 150),
};

const ICONS = ["calendar-heart", "video", "users-group", "id-badge-2"];

export default function Partenaires() {
  const mailto = `mailto:${SALON.email}?subject=${encodeURIComponent(
    "Devenir exposant Pixie Mariage"
  )}&body=${encodeURIComponent(
    "Bonjour,\n\nJe suis prestataire (catégorie : ...) et je souhaite prendre un stand sur Pixie Mariage.\n\nNom de l'entreprise :\nSIRET :\nVille :\nSite / réseaux :\n\nMerci !"
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
        </div>
      </section>

      <section className="section" id="prix">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="eyebrow">les prix</div>
          <h2 className="section-title">Les mêmes pour tous, affichés</h2>
          <p className="section-sub">Pas de prix négocié au téléphone : chaque exposant paie la même chose. Prix hors taxes, TVA de La Réunion (8,5 %) en sus.</p>
          <div className="prix-grille">
            {PRIX.map((l) => (
              <div className="prix-ligne" key={l.nom}>
                <div className="prix-quoi">
                  <h3>{l.nom}</h3>
                  <p>{l.detail}</p>
                </div>
                <div className="prix-montant">{l.prix}</div>
              </div>
            ))}
          </div>
          <p className="prix-note">
            Ce qui ne s&apos;achète jamais : une place dans le classement, un nombre de contacts, une mise en avant déguisée.
            Le détail est dans <Link href="/regles-du-salon">les règles du salon</Link>.
          </p>
        </div>
      </section>

      <section className="section" id="etapes">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="eyebrow">comment ça se passe</div>
          <h2 className="section-title">De la candidature à votre stand</h2>
          <div className="avantages" style={{ marginTop: 30 }}>
            {ETAPES.map((e, i) => (
              <div className="avantage" key={e.titre}>
                <div className="ic"><span aria-hidden="true">{i + 1}</span></div>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
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

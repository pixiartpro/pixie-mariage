import Link from "next/link";
import { SALON } from "../lib/data";

// Bloc de PIX-I-ART, organisateur du salon : hors classement, annoncé dans les Règles du salon
// (décision du 05/11/2026 : les vidéastes de mariage ne sont pas exposants, le studio est à part).
export default function StudioOrganisateur() {
  const mailto = `mailto:${SALON.email}?subject=${encodeURIComponent(
    "Film ou direct de mariage — PIX-I-ART"
  )}`;
  return (
    <section className="section studio-orga" aria-labelledby="studio-orga-titre">
      <div className="container">
        <div className="studio-panel">
        <div className="eyebrow">le studio organisateur · hors classement</div>
        <h2 className="section-title" id="studio-orga-titre">Votre mariage filmé, et en direct pour ceux qui sont loin</h2>
        <p className="section-sub">
          PIX-I-ART organise ce salon et tourne les vidéos des stands. Le studio filme aussi les mariages :
          en direct sur Internet, pour les proches qui ne peuvent pas venir, ou en film classique, tourné par
          PIX-I-ART ou par l&apos;un de ses cadreurs partenaires.
        </p>
        <div className="studio-actions">
          <a href={mailto} className="btn btn-gold">
            <i className="ti ti-mail" aria-hidden="true" /> Demander un devis au studio
          </a>
          <Link href="/regles-du-salon#studio" className="btn btn-ghost">Pourquoi ce bloc est à part</Link>
        </div>
        <p className="studio-note">
          C&apos;est l&apos;offre de l&apos;organisateur du salon. Elle est présentée à part et ne figure pas
          dans le classement des exposants. Le salon ne référence pas d&apos;autres vidéastes de mariage.
        </p>
        </div>
      </div>
    </section>
  );
}

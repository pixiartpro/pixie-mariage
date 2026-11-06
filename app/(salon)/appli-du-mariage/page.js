import Link from "next/link";
import { apercu, SITE } from "../../../lib/chemin";

export const metadata = {
  openGraph: apercu("L'appli du mariage — Pixie Mariage", "Le lieu et le programme avant, le moment en cours le jour J, le film et les photos après. Offerte aux mariés, ouverture très prochaine.", "og-appli", "appli-du-mariage/"),
  alternates: { canonical: `${SITE}/appli-du-mariage/` },
  title: "L'appli du mariage, offerte — Pixie Mariage",
  description:
    "Une appli pour vos invités, gratuite : le lieu et le programme avant, le moment en cours le jour J, le film et les photos après. Sans App Store, sans liste d'invités, effacée 90 jours après.",
};

const MOMENTS = [
  {
    ic: "map-pin",
    titre: "Avant",
    texte: "Le lieu en un appui, l'itinéraire, l'accès, la tenue, la navette. Le programme heure par heure. Le lien vers votre formulaire de réponse.",
  },
  {
    ic: "speakerphone",
    titre: "Le jour J",
    texte: "Le moment en cours s'allume tout seul. Un nuage approche ? Vous écrivez un mot, il s'affiche dans la minute chez les invités qui ont l'appli ouverte.",
  },
  {
    ic: "movie",
    titre: "Après",
    texte: "Votre mot de remerciement, le teaser et le film, la galerie du photographe. Et vos prestataires, pour que vos invités les retrouvent.",
  },
];

export default function AppliDuMariage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="kicker">Offerte aux mariés</span>
          <h1>L&apos;appli de votre mariage, pour vos invités</h1>
          <p className="lead">
            Un QR code sur le faire-part, et vos invités ont tout dans leur téléphone : avant, pendant et après. Rien à installer depuis un magasin d&apos;applis.
          </p>
          <div className="cta-row">
            <Link href="/appli-du-mariage/creer/" className="btn btn-rose">
              <i className="ti ti-heart" aria-hidden="true" /> Créer la nôtre
            </Link>
            <Link href="/mariage/?m=demo" className="btn btn-ghost">
              <i className="ti ti-device-mobile" aria-hidden="true" /> Voir un mariage de démonstration
            </Link>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="etapes">
            {MOMENTS.map((m) => (
              <div className="etape" key={m.titre}>
                <div className="num">
                  <i className={`ti ti-${m.ic}`} aria-hidden="true" />
                </div>
                <h3>{m.titre}</h3>
                <p>{m.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="studio-panel appli-honnete">
            <p className="eyebrow">Ce qu&apos;elle ne fait pas, exprès</p>
            <h2 className="section-title">Simple, et sans piège</h2>
            <ul className="appli-liste">
              <li><b>Pas de liste d&apos;invités.</b> Gardez votre formulaire de réponse habituel : l&apos;appli y mène.</li>
              <li><b>Pas d&apos;argent.</b> Ni cagnotte, ni paiement : on ne touche jamais à l&apos;argent des autres.</li>
              <li><b>Pas de photos stockées chez nous.</b> L&apos;album partagé, c&apos;est le vôtre (Google Photos, iCloud…).</li>
              <li><b>Pas de compte, pas de mot de passe.</b> Un lien privé pour vous deux, un code pour vos invités.</li>
              <li><b>Effacée 90 jours après le mariage.</b> Ou avant, d&apos;un bouton, quand vous voulez.</li>
            </ul>
            <div className="studio-actions">
              <Link href="/appli-du-mariage/creer/" className="btn btn-rose">Créer la nôtre, c&apos;est gratuit</Link>
              <Link href="/appli-du-mariage/confidentialite/" className="btn btn-ghost">Vos données, en détail</Link>
              <Link href="/appli-du-mariage/affiche/?m=demo" className="btn btn-ghost">L&apos;affiche à imprimer</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

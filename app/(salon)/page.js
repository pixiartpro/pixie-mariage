import Link from "next/link";
import Image from "next/image";
import { SALON, CATEGORIES, COPY, prestataireBySlug } from "../../lib/data";
import PrestataireCard from "../../components/PrestataireCard";
import StudioOrganisateur from "../../components/StudioOrganisateur";
import { SITE } from "../../lib/chemin";
// Une vraie image dès l'arrivée (retour d’une première visiteuse, dimanche 08/11/2026 : « il manquait quelque chose
// pour que, quand on arrive dessus, ça nous intéresse réellement »). L'échange des alliances vient d'un
// mariage filmé par PIX-I-ART, sans visage, déjà publié sur le site du studio. Jamais d'image IA ici.
import alliances from "../images/alliances.webp";
// Capture de la démo de l'appli des mariés (Léa & Mathis, couple inventé).
import appliDemo from "../images/appli-demo.webp";

// Trois exemples suffisent pour montrer à quoi ressemblera un stand.
const EXEMPLES = ["domaine-des-flamboyants", "lumiere-australe-studio", "saveurs-de-bourbon-traiteur"]
  .map(prestataireBySlug)
  .filter(Boolean);

// L'accueil : son adresse canonique (les autres pages ont la leur).
export const metadata = { alternates: { canonical: `${SITE}/` } };

// Trois tables rondes et leurs places, comme sur l'accueil de PixTable.
function Tables() {
  const tables = [50, 150, 250];
  // Une place en haut, une en bas, deux de chaque côté : les chaises de deux tables ne se touchent pas.
  const places = [30, 90, 150, 210, 270, 330].map((a) => (a * Math.PI) / 180);
  return (
    <svg className="tables" viewBox="0 0 300 130" aria-hidden="true">
      {tables.map((x, i) => (
        <g key={x}>
          {places.map((a) => (
            <circle key={a} className="siege" cx={x + 41 * Math.cos(a)} cy={65 + 41 * Math.sin(a)} r="7" />
          ))}
          <circle className="ronde" cx={x} cy="65" r="29" />
          <text x={x} y="66">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <section className="accueil">
        <div className="container accueil-grille">
          <figure className="accueil-photo">
            <Image
              src={alliances}
              alt="Échange des alliances lors d'un mariage filmé par PIX-I-ART"
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 860px) 100vw, 520px"
            />
            <figcaption>Un vrai mariage, filmé par PIX-I-ART</figcaption>
          </figure>
          <div className="accueil-texte">
            <span className="kicker"><span lang="rcf">{SALON.phrase}</span> · {SALON.lieu}</span>
            <h1>Le salon du mariage qui ne <em>ferme jamais</em>.</h1>
            <p className="lead">{COPY.heroSousTitre}</p>
            <div className="cta-row">
              <Link href="/annuaire" className="btn btn-gold">
                Visiter les stands <i className="ti ti-arrow-right" aria-hidden="true" />
              </Link>
              <a href="#offert" className="btn btn-ghost">
                <i className="ti ti-gift" aria-hidden="true" /> Les outils offerts
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section tight" id="offert">
        <div className="container">
          <div className="eyebrow">offert aux mariés</div>
          <h2 className="section-title">Deux outils pour votre grand jour</h2>
          <div className="offerts">
            <article className="offert">
              <div className="offert-visuel">
                <div className="telephone">
                  <Image src={appliDemo} alt="L'appli de démonstration du mariage de Léa et Mathis : la date, le lieu et l'itinéraire" sizes="190px" />
                </div>
              </div>
              <div className="offert-texte">
                <span className="badge-offert">Offert</span>
                <h3>L&apos;appli de votre mariage</h3>
                <p>Un QR code sur le faire-part : le lieu et le programme avant, le moment en cours le jour J, le film et les photos après. Effacée 90 jours après.</p>
                <div className="cta-row">
                  <Link href="/mariage/?m=demo" className="btn btn-gold btn-sm">
                    Voir la démo <i className="ti ti-arrow-right" aria-hidden="true" />
                  </Link>
                  <Link href="/appli-du-mariage/" className="btn btn-ghost btn-sm">Comment ça marche</Link>
                </div>
              </div>
            </article>
            <article className="offert">
              <div className="offert-visuel centre">
                <Tables />
              </div>
              <div className="offert-texte">
                <span className="badge-offert">Offert</span>
                <h3>PixTable, le plan de table</h3>
                <p>Il place vos invités tout seul selon vos règles : qui doit, ne peut pas ou aimerait être ensemble. À vous d&apos;ajuster d&apos;un glisser-déposer.</p>
                <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">
                  Ouvrir PixTable <i className="ti ti-arrow-right" aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="eyebrow">explorez</div>
          <h2 className="section-title">Tous les prestataires du mariage</h2>
          <div className="metiers">
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={`/annuaire?cat=${c.key}`} className="metier">
                <i className={`ti ti-${c.icon}`} aria-hidden="true" />
                <span>{c.nom}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="eyebrow">aperçu</div>
          <h2 className="section-title">À quoi ressemblera un stand</h2>
          <p className="section-sub">Ces fiches sont des exemples inventés pour montrer le salon. Les premiers vrais stands arriveront après leur tournage.</p>
          <div className="presta-grid apercu">
            {EXEMPLES.map((p) => (
              <PrestataireCard key={p.slug} p={p} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link href="/annuaire" className="btn btn-rose">Voir tous les stands</Link>
          </div>
        </div>
      </section>

      <StudioOrganisateur />

      <section className="section">
        <div className="container">
          <div className="eyebrow">comment ça marche</div>
          <h2 className="section-title">Trois étapes, sans courir toute l&apos;île</h2>
          <div className="etapes" style={{ marginTop: 30 }}>
            {COPY.etapes.map((e, i) => (
              <div className="etape" key={i}>
                <div className="num">{i + 1}</div>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">questions fréquentes</div>
          <h2 className="section-title">Bon à savoir</h2>
          <div className="faq" style={{ marginTop: 26 }}>
            {COPY.faq.map((f, i) => (
              <div className="faq-item" key={i}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

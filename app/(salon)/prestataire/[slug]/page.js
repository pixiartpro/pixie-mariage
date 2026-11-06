import Link from "next/link";
import {
  PRESTATAIRES,
  prestataireBySlug,
  catByKey,
  prestatairesByCat,
  SALON,
} from "../../../../lib/data";
import { catGrad } from "../../../../lib/theme";
import PrestataireCard from "../../../../components/PrestataireCard";
import { CompteurVue, LienContact } from "../../../../components/appli/Compteur";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRESTATAIRES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = prestataireBySlug(slug);
  return {
    title: p ? `${p.nom}${p.exemple ? " (exemple)" : ""} — Pixie Mariage` : "Prestataire — Pixie Mariage",
    description: p ? p.accroche : "",
  };
}

export default async function Fiche({ params }) {
  const { slug } = await params;
  const p = prestataireBySlug(slug);

  if (!p) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="section-title">Prestataire introuvable</h1>
          <div style={{ textAlign: "center" }}>
            <Link href="/annuaire" className="btn btn-rose">Retour aux stands</Link>
          </div>
        </div>
      </section>
    );
  }

  const cat = catByKey(p.categorie);
  const similaires = prestatairesByCat(p.categorie).filter((x) => x.slug !== p.slug).slice(0, 3);
  const mailto = `mailto:${SALON.email}?subject=${encodeURIComponent(
    "Demande de contact — " + p.nom
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nJ'aimerais être mis·e en relation avec ${p.nom} (${cat ? cat.nom : ""}, ${p.ville}), vu sur Pixie Mariage.\n\nMerci !`
  )}`;

  return (
    <>
      <CompteurVue slug={p.slug} />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Accueil</Link> &nbsp;/&nbsp; <Link href="/annuaire">Les stands</Link> &nbsp;/&nbsp;{" "}
          <span>{p.nom}</span>
        </div>

        {p.exemple && (
          <p className="exemple-bandeau">
            <i className="ti ti-info-circle" aria-hidden="true" /> Cette fiche est un exemple inventé pour montrer à quoi ressemblera un stand. Ce prestataire n&apos;existe pas.
          </p>
        )}

        <div className="fiche-hero">
          <div className="fiche-thumb" style={{ background: catGrad(p.categorie) }}>
            <i className={`ti ti-${cat ? cat.icon : "heart"} ic`} aria-hidden="true" />
            <span className="play" title="Vidéo de présentation">
              <i className="ti ti-player-play-filled" aria-hidden="true" />
            </span>
          </div>
          <div className="fiche-info">
            <span className="cat-tag">{cat ? cat.nom : ""}</span>
            <h1>{p.nom}</h1>
            <div className="ville">
              <i className="ti ti-map-pin" aria-hidden="true" /> {p.ville} · La Réunion
            </div>
            <p className="accroche">« {p.accroche} »</p>
            <div className="meta-row">
              <span className="prix" style={{ fontSize: 15 }}>{p.prix}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="fiche-body">
          <div>
            <h2>Présentation</h2>
            <p className="desc">{p.description}</p>
            <h2>Prestations</h2>
            <ul className="services-list">
              {p.services.map((s, i) => (
                <li key={i}>
                  <i className="ti ti-check" aria-hidden="true" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <div className="devis-card">
              {p.exemple ? (
                <>
                  <h3>Une fiche d&apos;exemple</h3>
                  <p>Ce stand n&apos;existe pas : on ne peut pas lui demander de devis. Vous êtes un pro du mariage à La Réunion ? Votre stand peut prendre sa place.</p>
                  <Link href="/partenaires" className="btn btn-rose">Devenir exposant</Link>
                </>
              ) : (
                <>
                  <h3>Intéressé·e&nbsp;?</h3>
                  <p>Contactez directement {p.nom} pour une disponibilité ou un devis. Sans intermédiaire, sans frais.</p>
                  <div className="prix-big">{p.prix}</div>
                  <LienContact slug={p.slug} href={mailto} className="btn btn-rose">
                    <i className="ti ti-mail" aria-hidden="true" /> Demander un devis
                  </LienContact>
                </>
              )}
              <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Préparer mon plan de table
              </a>
              <p style={{ marginBottom: 0, marginTop: 6 }}>Prestataire situé à {p.ville}.</p>
            </div>
          </aside>
        </div>
      </div>

      {similaires.length > 0 && (
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="container">
            <div className="eyebrow">à découvrir aussi</div>
            <h2 className="section-title">Dans la même catégorie</h2>
            <div className="presta-grid" style={{ marginTop: 24 }}>
              {similaires.map((x) => (
                <PrestataireCard key={x.slug} p={x} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

import Link from "next/link";
import { SALON, CATEGORIES, PRESTATAIRES, COPY, prestataireBySlug } from "../lib/data";
import { catGrad } from "../lib/theme";
import PrestataireCard from "../components/PrestataireCard";
import StudioOrganisateur from "../components/StudioOrganisateur";

const FEATURED = [
  "domaine-des-flamboyants",
  "lumiere-australe-studio",
  "fleurs-de-corail",
  "saveurs-de-bourbon-traiteur",
  "instant-precieux-wedding",
  "douceurs-de-leila",
].map(prestataireBySlug).filter(Boolean);

const VIDEOS = ["domaine-des-flamboyants", "lumiere-australe-studio", "esprit-boheme-deco"]
  .map(prestataireBySlug)
  .filter(Boolean);

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="kicker">Salon du mariage en ligne · {SALON.lieu}</span>
          <h1>Tout votre mariage, réuni au <em>même endroit</em>.</h1>
          <p className="lead">{COPY.heroSousTitre}</p>
          <div className="cta-row">
            <Link href="/annuaire" className="btn btn-gold">
              Visiter les stands <i className="ti ti-arrow-right" aria-hidden="true" />
            </Link>
            <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <i className="ti ti-armchair-2" aria-hidden="true" /> Plan de table offert
            </a>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="eyebrow">le concept</div>
          <h2 className="section-title">{COPY.conceptTitre}</h2>
          <p className="section-sub">{COPY.conceptTexte}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="eyebrow">explorez</div>
          <h2 className="section-title">Tous les prestataires du mariage</h2>
          <p className="section-sub">Choisissez une catégorie et découvrez les meilleurs professionnels de l&apos;île.</p>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={`/annuaire?cat=${c.key}`} className="cat-card">
                <div className="ic"><i className={`ti ti-${c.icon}`} aria-hidden="true" /></div>
                <h3>{c.nom}</h3>
                <p>{c.description}</p>
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
          <div className="presta-grid">
            {FEATURED.map((p) => (
              <PrestataireCard key={p.slug} p={p} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link href="/annuaire" className="btn btn-rose">Voir tous les stands</Link>
          </div>
        </div>
      </section>

      <StudioOrganisateur />

      <section className="band-dark">
        <div className="container">
          <div className="eyebrow">le salon vidéo</div>
          <h2 className="section-title">Bientôt, découvrez-les en vidéo</h2>
          <p className="section-sub">Chaque prestataire se présentera en vidéo : son lieu, son univers, son savoir-faire — comme sur un stand, pour ressentir l&apos;émotion avant même de le contacter.</p>
          <div className="video-grid">
            {VIDEOS.map((p) => (
              <div className="video-card" key={p.slug}>
                <div className="screen" style={{ background: catGrad(p.categorie) }}>
                  <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.16)", color: "#F5EEE6", fontSize: 12, padding: "3px 11px", borderRadius: 999 }}>Bientôt</span>
                  <span className="play"><i className="ti ti-player-play-filled" aria-hidden="true" /></span>
                </div>
                <div className="vinfo">
                  <h4>{p.nom}</h4>
                  <span>{p.ville}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="video-note">Vidéos de présentation produites par le studio PIX-I-ART — à venir.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">comment ça marche</div>
          <h2 className="section-title">Votre mariage, en toute sérénité</h2>
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

      <section className="pixtable-band">
        <div className="container pixtable-inner">
          <div className="txt">
            <span className="badge-offert">Offert</span>
            <h2>PixTable, votre plan de table sans prise de tête</h2>
            <p>Notre outil gratuit place vos invités tout seul selon vos règles (qui doit, ne peut pas, aimerait être ensemble) — à vous d&apos;ajuster d&apos;un glisser-déposer.</p>
          </div>
          <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
            Ouvrir PixTable <i className="ti ti-arrow-right" aria-hidden="true" />
          </a>
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

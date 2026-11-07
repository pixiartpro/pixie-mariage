import Link from "next/link";
import { SALON, CATEGORIES } from "../lib/data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div style={{ maxWidth: 300 }}>
            <div className="name">Pixie Mariage</div>
            <div className="phrase" lang="rcf">{SALON.phrase}</div>
            <div className="sig">{SALON.signature} — {SALON.lieu}</div>
            <p style={{ marginTop: 10, fontSize: 14 }}>
              Le salon du mariage 100 % en ligne, ouvert toute l&apos;année.
            </p>
          </div>
          <div>
            <h4>Le salon</h4>
            <Link href="/annuaire">Les stands du salon</Link>
            <Link href="/partenaires">Devenir exposant</Link>
            <Link href="/regles-du-salon">Les règles du salon</Link>
            <Link href="/appli-du-mariage">L&apos;appli du mariage (gratuite)</Link>
            <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer">Plan de table (gratuit)</a>
            <Link href="/espace-exposant">Espace exposant</Link>
            <a href={`mailto:${SALON.email}`}>Nous contacter</a>
          </div>
          <div>
            <h4>Catégories</h4>
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link key={c.key} href={`/annuaire?cat=${c.key}`}>{c.nom}</Link>
            ))}
          </div>
        </div>
        <div className="bottom">
          © 2026 PIX-I-ART · <Link href="/mentions-legales/">Mentions légales</Link> · <Link href="/mentions-legales/#confidentialite">Confidentialité</Link> · <Link href="/regles-du-salon/">Règles du salon</Link>
          <br />
          Un Monde Pixie, façonné par PIX-I-ART · {SALON.lieu}
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { SALON } from "../lib/data";
import CompteSelection from "./CompteSelection";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo">
          <span className="dot" />
          <span className="name">Pixie Mariage</span>
          <span className="sig hide-mobile">· {SALON.signature}</span>
        </Link>
        <nav className="nav">
          <Link href="/annuaire">Les stands</Link>
          <Link href="/appli-du-mariage" className="hide-mobile">L&apos;appli du mariage</Link>
          <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer" className="hide-mobile">
            Plan de table
          </a>
          <CompteSelection />
          <Link href="/partenaires" className="nav-cta">
            <span className="cta-long">Devenir exposant</span>
            <span className="cta-court">Exposer</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { SALON } from "../lib/data";

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
          <a href={SALON.pixtable} target="_blank" rel="noopener noreferrer" className="hide-mobile">
            Plan de table
          </a>
          <Link href="/partenaires" className="nav-cta">
            Devenir exposant
          </Link>
        </nav>
      </div>
    </header>
  );
}

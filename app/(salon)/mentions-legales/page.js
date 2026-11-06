import { readFileSync } from "node:fs";
import { join } from "node:path";
import { apercu, SITE } from "../../../lib/chemin";

export const metadata = {
  title: "Mentions légales et confidentialité — Pixie Mariage",
  description: "L'éditeur, l'hébergeur, les données personnelles et vos droits.",
  openGraph: apercu("Mentions légales et confidentialité — Pixie Mariage", "L'éditeur, l'hébergeur, les données personnelles et vos droits.", "og-salon", "mentions-legales/"),
  alternates: { canonical: `${SITE}/mentions-legales/` },
};

// Le texte vient du générateur du socle commun (une seule source : la fiche produit), lu au moment de construire le site.
export default function Mentions() {
  const html = readFileSync(join(process.cwd(), "contenu/mentions-legales.html"), "utf8");
  return (
    <section className="section tight">
      <div className="container appli-texte socle-mentions" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

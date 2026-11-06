import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = { title: "Page introuvable — Pixie Mariage" };

export default function Introuvable() {
  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <p className="eyebrow">Page introuvable</p>
            <h1 className="section-title">Cette page n&apos;existe pas, ou plus</h1>
            <p className="section-sub">Le lien est peut-être incomplet. Vous cherchiez l&apos;appli d&apos;un mariage ? Ouvrez le lien du faire-part en entier.</p>
            <div className="cta-row">
              <Link href="/" className="btn btn-rose">Retour au salon</Link>
              <Link href="/mariage/" className="btn btn-ghost">L&apos;appli du mariage</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Les pages du salon : menu en haut, pied de page en bas.
export default function SalonLayout({ children }) {
  return (
    <>
      <a href="#contenu" className="aller-contenu">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
    </>
  );
}

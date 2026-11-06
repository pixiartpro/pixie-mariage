"use client";
export default function BoutonImprimer({ texte = "Imprimer" }) {
  return (
    <button type="button" className="ed-lien" onClick={() => window.print()}>
      <i className="ti ti-printer" aria-hidden="true" /> {texte}
    </button>
  );
}

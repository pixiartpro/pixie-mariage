"use client";

// L'affiche A5 de l'appli, que les mariés impriment pour l'accueil, les tables ou le livret.
// Adresse : /appli-du-mariage/affiche/?m=<mariage>#c=<code>  (ou ?m=demo).
import { useEffect, useState } from "react";
import Link from "next/link";
import QrCode from "./QrCode";
import { lireMariage } from "../../lib/appli/stockage";
import { dateLisible } from "../../lib/appli/contenu";
import { PREFIXE, SITE } from "../../lib/chemin";
import BoutonImprimer from "../BoutonImprimer";

export default function AfficheMariage() {
  const [etat, setEtat] = useState({ ok: null });
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("m") || "";
    const c = new URLSearchParams(window.location.hash.slice(1)).get("c") || "";
    if (!/^[a-z0-9-]{1,80}$/.test(m)) return setEtat({ ok: false });
    lireMariage(m, c)
      .then((r) => {
        if (!r) return setEtat({ ok: false });
        // Toujours l'adresse publique : un QR imprimé depuis le Mac doit marcher chez les invités.
        const lien = `${SITE}/mariage/?m=${m}${m === "demo" ? "" : `#c=${c.toUpperCase()}`}`;
        setEtat({ ok: true, m: r.contenu, code: m === "demo" ? "" : c.toUpperCase(), lien, demo: !!r.demo });
      })
      .catch(() => setEtat({ ok: false }));
  }, []);

  if (etat.ok === null) return <p className="ed-attente">Préparation de l&apos;affiche…</p>;
  if (!etat.ok)
    return (
      <div className="ed-bloc ed-centre">
        <h2>Cette affiche ne s&apos;ouvre pas</h2>
        <p className="ed-aide">Ouvrez-la depuis votre espace des mariés, bouton « Imprimer l&apos;affiche ».</p>
        <a className="btn btn-ghost" href={`${PREFIXE}/appli-du-mariage/affiche/?m=demo`}>Voir l&apos;affiche de la démo</a>
      </div>
    );
  const { m } = etat;
  return (
    <>
      <p className="no-print ed-aide" style={{ textAlign: "center", marginBottom: 14 }}>
        Format A5, à poser à l&apos;accueil ou sur les tables. <BoutonImprimer texte="Imprimer l'affiche" />
      </p>
      <article className="feuille-a5 affiche-mariage">
        {etat.demo && <p className="affiche-demo">Démonstration · mariage inventé</p>}
        <p className="eyebrow">Bienvenue au mariage de</p>
        <h1>
          {m.prenoms[0]} <span>&amp;</span> {m.prenoms[1]}
        </h1>
        <p className="feuille-lead">{dateLisible(m.date)}{m.lieu.nom ? ` · ${m.lieu.nom}` : ""}</p>
        <div className="affiche-qr">
          <QrCode texte={etat.lien} taille={190} sansBouton label="QR code de l'appli du mariage" />
        </div>
        <p className="affiche-quoi">Le programme, le lieu, le moment en cours et, après la fête, le film et les photos.</p>
        <p className="affiche-sans">Pas d&apos;appli à télécharger, pas de compte.</p>
        {etat.code && (
          <p className="affiche-code">
            Code : <b>{etat.code}</b>
          </p>
        )}
        <p className="affiche-signe">L&apos;appli du mariage · Pixie Mariage</p>
      </article>
    </>
  );
}

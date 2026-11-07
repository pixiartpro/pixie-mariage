"use client";

// L'espace exposant : ses chiffres, et deux demandes (modifier la fiche, publier une offre).
// Adresse : /espace-exposant/?s=<stand>#k=<clé remise par PIX-I-ART à la signature>.

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRESTATAIRES, SALON } from "../../lib/data";
import { chiffresExposant, MODE } from "../../lib/appli/stockage";

const choix = MODE === "essai" ? PRESTATAIRES : PRESTATAIRES.filter((p) => !p.exemple);
const nombre = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

export default function EspaceExposant() {
  const [slug, setSlug] = useState("");
  const [cle, setCle] = useState("");
  const [res, setRes] = useState(null);
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);

  const ouvrir = async (s, k) => {
    setOccupe(true);
    setErreur("");
    try {
      const r = await chiffresExposant(s, k);
      if (!r) setErreur("Ce stand et cette clé ne vont pas ensemble. La clé vous a été remise à la signature de votre contrat.");
      else if (!PRESTATAIRES.some((p) => p.slug === s)) setErreur("Votre stand n'est pas encore en ligne sur le site. Vos chiffres s'afficheront dès sa mise en ligne.");
      else {
        setRes(r);
        try {
          sessionStorage.setItem("pm:exposant", JSON.stringify({ s, k }));
        } catch {}
      }
    } catch (e) {
      setErreur(e.message);
    } finally {
      setOccupe(false);
    }
  };

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("s") || "";
    const k = new URLSearchParams(window.location.hash.slice(1)).get("k") || "";
    let memo = null;
    try {
      memo = JSON.parse(sessionStorage.getItem("pm:exposant") || "null");
    } catch {}
    const s2 = s || memo?.s || choix[0]?.slug || "";
    setSlug(s2);
    const k2 = k || (memo && memo.s === s2 ? memo.k : "");
    setCle(k2);
    if (s2 && k2) ouvrir(s2, k2);
  }, []);

  const fiche = PRESTATAIRES.find((p) => p.slug === slug);

  if (res && fiche) {
    const sujet = (t) => `mailto:${SALON.email}?subject=${encodeURIComponent(`${t} — ${fiche.nom}`)}`;
    const jours = (res.jours || []).slice(-30);
    const max = Math.max(1, ...jours.map((j) => j.vue));
    return (
      <div className="ex">
        {MODE === "essai" && (
          <p className="ed-essai">
            <i className="ti ti-flask" aria-hidden="true" /> Mode essai : ces chiffres sont ceux de ce navigateur seulement. Ouvrez la fiche du stand puis revenez ici : le total des fiches vues bouge.
          </p>
        )}
        <div className="ex-tete">
          <div>
            <h2>{fiche.nom}</h2>
            <p className="ed-aide">
              {fiche.ville} · <Link href={`/prestataire/${fiche.slug}/`}>voir mon stand</Link>
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              try {
                sessionStorage.removeItem("pm:exposant");
              } catch {}
              setRes(null);
              setCle("");
            }}
          >
            Fermer
          </button>
        </div>

        <h3 className="ex-titre">Vos 30 derniers jours</h3>
        <div className="ex-tuiles">
          <Tuile n={res.mois?.vue} label="fiches vues" />
          <Tuile n={res.mois?.contact} label="clics sur « Demander un devis »" />
          <Tuile n={res.mois?.depuis_mariage} label="visites venues d'une appli de mariage" />
          <Tuile n={res.mariages} label={res.mariages > 1 ? "mariages vous citent dans leur appli, depuis l'ouverture" : "mariage vous cite dans son appli, depuis l'ouverture"} />
        </div>

        {jours.length > 0 && (
          <figure className="ex-graph">
            <figcaption>
              <b>Fiches vues, jour par jour</b>
              <span>30 derniers jours · le plus haut : {nombre(max)}</span>
            </figcaption>
            <div className="ex-barres" role="img" aria-label={`Fiches vues par jour, maximum ${max}`}>
              {jours.map((j) => (
                <span key={j.jour} style={{ height: `${Math.max(3, (j.vue / max) * 100)}%` }} title={`${j.jour} : ${j.vue}`} />
              ))}
            </div>
          </figure>
        )}

        <p className="ed-aide">
          Depuis l&apos;ouverture : {nombre(res.totaux?.vue)} fiches vues, {nombre(res.totaux?.contact)}{" "}clics sur le contact. Ce sont des chiffres indicatifs, bruts : une même personne peut revenir plusieurs fois, et nous ne savons pas qui regarde, c&apos;est voulu. Les mariages comptés sont ceux dont l&apos;appli a été ouverte par au moins un invité. Ils restent comptés après l&apos;effacement de l&apos;appli, 90 jours après la fête.
        </p>

        <div className="ex-actions">
          <a className="btn btn-rose btn-sm" href={sujet("Modifier ma fiche")}>
            <i className="ti ti-edit" aria-hidden="true" /> Demander une modification de ma fiche
          </a>
          <a className="btn btn-ghost btn-sm" href={sujet("Publier une offre")}>
            <i className="ti ti-discount" aria-hidden="true" /> Publier une offre
          </a>
        </div>
        <p className="ed-aide">Les modifications sont faites par l&apos;équipe sous 3 jours ouvrés, après vérification (règles du salon).</p>
      </div>
    );
  }

  return (
    <form
      className="ed-bloc ex-entree"
      onSubmit={(e) => {
        e.preventDefault();
        ouvrir(slug, cle.trim());
      }}
    >
      {MODE === "essai" && (
        <p className="ed-essai">
          <i className="ti ti-flask" aria-hidden="true" /> Mode essai : choisissez n&apos;importe quel stand et tapez la clé <b>essai</b>.
        </p>
      )}
      <label className="ed-champ">
        <span>Votre stand</span>
        {choix.length ? (
          <select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {choix.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.nom}
                {p.exemple ? " (exemple)" : ""}
              </option>
            ))}
          </select>
        ) : (
          <input value={slug} onChange={(e) => setSlug(e.target.value.trim().toLowerCase())} placeholder="le-nom-de-votre-stand" />
        )}
      </label>
      <label className="ed-champ">
        <span>Votre clé</span>
        <input value={cle} onChange={(e) => setCle(e.target.value)} autoComplete="off" spellCheck={false} required />
      </label>
      {erreur && <p className="ed-erreur" role="alert">{erreur}</p>}
      <button className="btn btn-rose" type="submit" disabled={occupe}>
        {occupe ? "Ouverture…" : "Voir mes chiffres"}
      </button>
      <p className="ed-aide">
        Pas encore exposant ? <Link href="/partenaires/">Devenir exposant</Link>. Clé perdue ? Écrivez à <a href={`mailto:${SALON.email}`}>{SALON.email}</a>.
      </p>
    </form>
  );
}

function Tuile({ n, label }) {
  return (
    <div className="ex-tuile">
      <b>{nombre(n)}</b>
      <span>{label}</span>
    </div>
  );
}

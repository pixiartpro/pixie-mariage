"use client";

// « Ma sélection » : les stands mis de côté, une note par stand, et le partage à deux par un lien.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, PRESTATAIRES, SALON, catByKey } from "../lib/data";
import { lireSelection, ecouter, basculer, noter, ajouterPlusieurs, slugsDuLien } from "../lib/selection";
import { compter } from "../lib/appli/stockage";
import { PREFIXE } from "../lib/chemin";

const fiche = (slug) => PRESTATAIRES.find((p) => p.slug === slug);

export default function MaSelection() {
  const [liste, setListe] = useState(null);
  const [partagee, setPartagee] = useState([]);
  const [msg, setMsg] = useState("");
  const minuteur = useRef(null);

  useEffect(() => {
    const maj = () => setListe(lireSelection());
    maj();
    setPartagee(slugsDuLien(new URLSearchParams(window.location.search).get("s")));
    return ecouter(maj);
  }, []);

  const lien = useMemo(() => {
    if (!liste || !liste.length || typeof window === "undefined") return "";
    return `${window.location.origin}${PREFIXE}/ma-selection/?s=${liste.map((x) => x.slug).join(",")}`;
  }, [liste]);

  if (!liste) return <p className="ed-attente">Ouverture…</p>;

  const dire = (t) => {
    setMsg(t);
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setMsg(""), 3000);
  };
  const partager = async () => {
    const texte = "Notre sélection de prestataires sur Pixie Mariage";
    if (navigator.share) {
      try {
        await navigator.share({ title: texte, text: texte, url: lien });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return; // la personne a fermé le partage
      }
    }
    try {
      await navigator.clipboard.writeText(lien);
      dire("Lien copié : envoyez-le à votre moitié.");
    } catch {
      dire("Copiez le lien ci-dessous pour l'envoyer.");
    }
  };

  const nouveauxPartages = partagee.filter((s) => !liste.some((x) => x.slug === s));

  return (
    <div className="sel">
      {partagee.length > 0 && (
        <section className="sel-recue">
          <h2>
            <i className="ti ti-hearts" aria-hidden="true" /> La sélection qu&apos;on vous a envoyée
          </h2>
          <ul className="sel-liste">
            {partagee.map((s) => {
              const f = fiche(s);
              const cat = catByKey(f.categorie);
              return (
                <li key={s} className="sel-ligne">
                  <div className="sel-quoi">
                    <Link href={`/prestataire/${s}`}>
                      <b>{f.nom}</b>
                    </Link>
                    <span>
                      {cat?.nom} · {f.ville}
                      {f.exemple ? " · exemple" : ""}
                    </span>
                  </div>
                  <span className="sel-etat">{liste.some((x) => x.slug === s) ? "Déjà chez vous" : ""}</span>
                </li>
              );
            })}
          </ul>
          {nouveauxPartages.length > 0 ? (
            <button
              type="button"
              className="btn btn-rose btn-sm"
              onClick={() => {
                const n = ajouterPlusieurs(nouveauxPartages);
                dire(`${n} stand${n > 1 ? "s" : ""} ajouté${n > 1 ? "s" : ""} à votre sélection.`);
                window.history.replaceState(null, "", window.location.pathname);
                setPartagee([]);
              }}
            >
              <i className="ti ti-heart-plus" aria-hidden="true" /> Tout ajouter à ma sélection
            </button>
          ) : (
            <p className="ed-aide">Tous ces stands sont déjà dans votre sélection.</p>
          )}
        </section>
      )}

      {msg && <p className="ed-ok" role="status">{msg}</p>}

      {liste.length === 0 ? (
        <div className="sel-vide">
          <i className="ti ti-heart" aria-hidden="true" />
          <h2>Votre sélection est vide</h2>
          <p className="ed-aide">Touchez le cœur d&apos;un stand pour le mettre de côté. Vous comparez ensuite ici, à deux, à votre rythme.</p>
          <Link href="/annuaire" className="btn btn-rose">Voir les stands</Link>
        </div>
      ) : (
        <>
          {CATEGORIES.map((cat) => {
            const ici = liste.filter((x) => fiche(x.slug)?.categorie === cat.key);
            if (!ici.length) return null;
            return (
              <section key={cat.key} className="sel-cat">
                <h2>
                  <i className={`ti ti-${cat.icon}`} aria-hidden="true" /> {cat.nom} <small>{ici.length}</small>
                </h2>
                <ul className="sel-liste">
                  {ici.map((x) => {
                    const f = fiche(x.slug);
                    const mailto = `mailto:${SALON.email}?subject=${encodeURIComponent("Demande de contact — " + f.nom)}&body=${encodeURIComponent(
                      `Bonjour,\n\nJ'aimerais être mis·e en relation avec ${f.nom} (${cat.nom}, ${f.ville}), vu sur Pixie Mariage.\n\nMerci !`
                    )}`;
                    return (
                      <li key={x.slug} className="sel-ligne">
                        <div className="sel-quoi">
                          <Link href={`/prestataire/${f.slug}`}>
                            <b>{f.nom}</b>
                          </Link>
                          <span>
                            {f.ville} · {f.prix}
                            {f.exemple && <span className="exemple-tag sel-tag">Exemple</span>}
                          </span>
                          <label className="sel-note">
                            <span className="sr">Note sur {f.nom}</span>
                            <input
                              value={x.note || ""}
                              maxLength={200}
                              placeholder="Votre note (devis demandé, à visiter…)"
                              onChange={(e) => noter(x.slug, e.target.value)}
                            />
                          </label>
                        </div>
                        <div className="sel-actions">
                          {!f.exemple && (
                            <a className="btn btn-ghost btn-sm" href={mailto} onClick={() => compter(f.slug, "contact")}>
                              <i className="ti ti-mail" aria-hidden="true" /> Devis
                            </a>
                          )}
                          <button type="button" className="ed-retirer" aria-label={`Retirer ${f.nom}`} title="Retirer" onClick={() => basculer(f.slug)}>
                            <i className="ti ti-x" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <section className="ed-bloc sel-partage">
            <h3>Choisir à deux</h3>
            <p className="ed-aide">Envoyez votre sélection à votre moitié : elle l&apos;ouvre sur son téléphone et l&apos;ajoute à la sienne. Le lien contient seulement les stands, pas vos notes.</p>
            <div className="ed-puces">
              <button type="button" className="btn btn-rose btn-sm" onClick={partager}>
                <i className="ti ti-share" aria-hidden="true" /> Envoyer ma sélection
              </button>
              <a className="btn btn-ghost btn-sm" href={`https://wa.me/?text=${encodeURIComponent("Notre sélection pour le mariage : " + lien)}`} target="_blank" rel="noopener noreferrer">
                <i className="ti ti-brand-whatsapp" aria-hidden="true" /> Par WhatsApp
              </a>
            </div>
            <div className="ed-copie">
              <input readOnly value={lien} aria-label="Lien de votre sélection" onFocus={(e) => e.target.select()} />
            </div>
          </section>

          <p className="ed-aide sel-pied">
            Votre sélection et vos notes restent sur cet appareil. Rien ne nous est envoyé, sauf si vous demandez un devis.
            {liste.some((x) => !fiche(x.slug)?.exemple) && (
              <>
                {" "}Vos prestataires sont choisis ? Ils pourront apparaître dans <Link href="/appli-du-mariage">l&apos;appli de votre mariage</Link>, pour que vos invités les retrouvent.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}

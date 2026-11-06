"use client";

// La candidature exposant, en 3 étapes : la formule et son prix, les 3 pièces, la demande prête à envoyer.
// Rien n'est enregistré sur un serveur : la demande part depuis la messagerie de l'exposant.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, SALON } from "../lib/data";
import { FORMULES, PLACES_FONDATEUR, TARIFS, devis, euros, ttc, siretValide } from "../lib/tarifs";

const BROUILLON = "pm:candidature";
const vide = {
  formule: "stand",
  partenaire: false,
  entreprise: "",
  categorie: "",
  commune: "",
  siret: "",
  web: "",
  contact: "",
  telephone: "",
  film: "",
  pieces: { siret: false, assurance: false, metier: false },
  videaste: { mariages: false, references: false, droits: false },
};

export default function Candidature() {
  const [c, setC] = useState(vide);
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BROUILLON) || "null");
      if (b && typeof b === "object") setC({ ...vide, ...b, pieces: { ...vide.pieces, ...b.pieces }, videaste: { ...vide.videaste, ...b.videaste } });
    } catch {}
    // Lien direct depuis la grille : ?formule=mesure
    const f = new URLSearchParams(window.location.search).get("formule");
    if (FORMULES.some((x) => x.key === f)) setC((v) => ({ ...v, formule: f }));
    setPret(true);
  }, []);
  useEffect(() => {
    if (!pret) return;
    try {
      localStorage.setItem(BROUILLON, JSON.stringify(c));
    } catch {}
  }, [c, pret]);

  const estVideaste = c.categorie === "videastes";
  // Un vidéaste ne prend pas de film tourné par le studio : sa formule est imposée.
  const formule = estVideaste ? "videaste" : c.formule === "videaste" ? "stand" : c.formule;
  const fondateur = PLACES_FONDATEUR > 0;
  const d = useMemo(() => devis({ formule, fondateur, partenaire: c.partenaire }), [formule, fondateur, c.partenaire]);
  const maj = (k, v) => setC((x) => ({ ...x, [k]: v }));

  const cat = CATEGORIES.find((x) => x.key === c.categorie);
  const texte = [
    "Bonjour,",
    "",
    "Je souhaite prendre un stand sur Pixie Mariage.",
    "",
    `Entreprise : ${c.entreprise}`,
    `Métier : ${cat ? cat.nom : ""}`,
    `Commune : ${c.commune}`,
    `SIRET : ${c.siret.replace(/\s/g, "")}`,
    `Site ou réseaux : ${c.web || "—"}`,
    `Contact : ${c.contact}${c.telephone ? " · " + c.telephone : ""}`,
    "",
    `Formule : ${d.formule.nom}${c.partenaire ? " + partenaire du mois" : ""}`,
    `Prix affiché : ${euros(d.premiere)} HT la première année (${euros(ttc(d.premiere))} TTC), puis ${euros(d.ensuite)} HT par an${fondateur ? ` (tarif fondateur pour mes trois premières années, puis ${euros(d.apresFondateur)} HT)` : ""}.`,
    "",
    "Mes pièces, que je montrerai à la visite :",
    `- SIRET actif : ${c.pieces.siret ? "oui" : "à vérifier"}`,
    `- Assurance responsabilité civile professionnelle à jour : ${c.pieces.assurance ? "oui" : "à vérifier"}`,
    `- Pièce de mon métier : ${c.pieces.metier ? "oui, ou mon métier n'en demande pas" : "à vérifier"}`,
    ...(estVideaste
      ? [
          "",
          "Vidéaste :",
          `- Au moins 10 mariages filmés à La Réunion en deux ans : ${c.videaste.mariages ? "oui" : "à vérifier"}`,
          `- 3 références vérifiables : ${c.videaste.references ? "oui" : "à vérifier"}`,
          `- Un film complet que j'ai le droit de montrer : ${c.videaste.droits ? "oui" : "à vérifier"}${c.film ? " — " + c.film : ""}`,
        ]
      : []),
    "",
    "Merci, j'attends votre réponse pour fixer la visite.",
  ].join("\n");
  const mailto = `mailto:${SALON.email}?subject=${encodeURIComponent(`Candidature exposant — ${c.entreprise || "Pixie Mariage"}`)}&body=${encodeURIComponent(texte)}`;

  const verifier = () => {
    if (!c.entreprise.trim()) return "le nom de votre entreprise";
    if (!c.categorie) return "votre métier";
    if (!c.commune.trim()) return "votre commune";
    if (!siretValide(c.siret)) return "un SIRET valable (14 chiffres)";
    if (!c.contact.trim()) return "votre nom";
    return "";
  };

  if (envoye)
    return (
      <div className="ed-bloc ed-centre cand-fin">
        <i className="ti ti-mail-check" aria-hidden="true" />
        <h2>Votre messagerie a dû s&apos;ouvrir</h2>
        <p className="ed-aide">
          Envoyez le mail préparé : nous vous répondons par écrit pour fixer la visite. Rien n&apos;est signé ni payé à ce stade.
        </p>
        <p className="ed-aide">
          Rien ne s&apos;est ouvert ? Copiez votre demande et envoyez-la à <a href={`mailto:${SALON.email}`}>{SALON.email}</a>.
        </p>
        <div className="cta-row">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(texte);
                setCopie(true);
              } catch {}
            }}
          >
            <i className="ti ti-copy" aria-hidden="true" /> {copie ? "Demande copiée" : "Copier ma demande"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEnvoye(false)}>
            Revenir à ma demande
          </button>
        </div>
      </div>
    );

  return (
    <form
      className="cand"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const manque = verifier();
        if (manque) return setErreur(`Il manque ${manque}.`);
        setErreur("");
        window.location.href = mailto;
        setEnvoye(true);
      }}
    >
      <fieldset className="ed-bloc">
        <legend>1. Votre formule, votre prix</legend>
        <label className="ed-champ">
          <span>Votre métier</span>
          <select value={c.categorie} onChange={(e) => maj("categorie", e.target.value)}>
            <option value="">Choisir…</option>
            {CATEGORIES.map((x) => (
              <option key={x.key} value={x.key}>
                {x.nom}
              </option>
            ))}
          </select>
        </label>
        <div className="cand-formules" role="radiogroup" aria-label="Formule">
          {FORMULES.filter((f) => (estVideaste ? f.key === "videaste" : f.key !== "videaste")).map((f) => (
            <label key={f.key} className={`cand-formule ${formule === f.key ? "on" : ""}`}>
              <input type="radio" name="formule" value={f.key} checked={formule === f.key} onChange={() => maj("formule", f.key)} />
              <b>{f.nom}</b>
              <span>{f.aide}</span>
            </label>
          ))}
        </div>
        <label className="ed-accord">
          <input type="checkbox" checked={c.partenaire} onChange={(e) => maj("partenaire", e.target.checked)} />
          <span>
            J&apos;ajoute le partenaire du mois ({euros(TARIFS.partenaireMois)} HT) : un portrait monté et l&apos;encart du mois sur l&apos;accueil, signalé « sponsorisé ».
          </span>
        </label>

        <div className="cand-prix" aria-live="polite">
          <div className="cand-prix-ligne">
            <span>La première année</span>
            <b>{euros(d.premiere)} HT</b>
          </div>
          <p className="cand-detail">
            {d.film > 0 && <>Film {euros(d.film)} · </>}présence {euros(d.presence)}
            {d.partenaire > 0 && <> · partenaire du mois {euros(d.partenaire)}</>} · soit {euros(ttc(d.premiere))} TTC
          </p>
          <div className="cand-prix-ligne">
            <span>Les années suivantes</span>
            <b>{euros(d.ensuite)} HT / an</b>
          </div>
          {fondateur ? (
            <p className="cand-detail">
              <i className="ti ti-star" aria-hidden="true" /> Tarif fondateur : il reste {PLACES_FONDATEUR} place{PLACES_FONDATEUR > 1 ? "s" : ""} sur 10. Présence à {euros(TARIFS.presenceFondateur)} HT pour vos trois premières années, la première comprise, puis {euros(d.apresFondateur)} HT. La place est réservée à la signature, pas à la candidature.
            </p>
          ) : (
            <p className="cand-detail">Les 10 places fondateur sont prises : grille publique.</p>
          )}
        </div>
      </fieldset>

      <fieldset className="ed-bloc">
        <legend>2. Les pièces à montrer à la visite</legend>
        <p className="ed-aide">
          Les mêmes pour tous, vérifiées sur place avant l&apos;ouverture du stand (<Link href="/regles-du-salon">règles du salon</Link>). Cochez ce que vous avez déjà : rien ne bloque votre demande.
        </p>
        {[
          ["siret", "Une immatriculation active (SIRET)"],
          ["assurance", "Une assurance responsabilité civile professionnelle à jour"],
          ["metier", "La pièce de votre métier, s'il en demande une (déclaration sanitaire, licence, diplôme…)"],
        ].map(([k, t]) => (
          <label key={k} className="ed-accord">
            <input type="checkbox" checked={c.pieces[k]} onChange={(e) => setC((x) => ({ ...x, pieces: { ...x.pieces, [k]: e.target.checked } }))} />
            <span>{t}</span>
          </label>
        ))}
        {estVideaste && (
          <div className="cand-videaste">
            <p className="ed-aide">
              <b>Vidéastes</b> : le studio organisateur exerce aussi ce métier, donc vos critères sont écrits et les mêmes pour tous.
            </p>
            {[
              ["mariages", "Au moins 10 mariages filmés à La Réunion ces deux dernières années"],
              ["references", "3 références vérifiables (couples ou lieux)"],
              ["droits", "Un film de mariage complet que j'ai le droit de montrer (accord des mariés, musique sous licence)"],
            ].map(([k, t]) => (
              <label key={k} className="ed-accord">
                <input type="checkbox" checked={c.videaste[k]} onChange={(e) => setC((x) => ({ ...x, videaste: { ...x.videaste, [k]: e.target.checked } }))} />
                <span>{t}</span>
              </label>
            ))}
            <label className="ed-champ">
              <span>Lien vers ce film (facultatif)</span>
              <input type="url" inputMode="url" value={c.film} onChange={(e) => maj("film", e.target.value)} placeholder="https://…" />
            </label>
          </div>
        )}
      </fieldset>

      <fieldset className="ed-bloc">
        <legend>3. Votre demande</legend>
        <div className="ed-ligne2">
          <Champ label="Nom de l'entreprise" valeur={c.entreprise} onChange={(v) => maj("entreprise", v)} requis />
          <Champ label="Commune" valeur={c.commune} onChange={(v) => maj("commune", v)} requis />
        </div>
        <div className="ed-ligne2">
          <Champ
            label="SIRET (14 chiffres)"
            valeur={c.siret}
            onChange={(v) => maj("siret", v.replace(/[^\d\s]/g, "").slice(0, 17))}
            requis
            inputMode="numeric"
            note={c.siret.replace(/\s/g, "").length === 14 && !siretValide(c.siret) ? "Ce numéro ne semble pas exact : vérifiez-le." : ""}
          />
          <Champ label="Site ou réseaux (facultatif)" valeur={c.web} onChange={(v) => maj("web", v)} />
        </div>
        <div className="ed-ligne2">
          <Champ label="Votre nom" valeur={c.contact} onChange={(v) => maj("contact", v)} requis />
          <Champ label="Téléphone (facultatif)" valeur={c.telephone} onChange={(v) => maj("telephone", v)} inputMode="tel" />
        </div>
        <p className="ed-aide">
          La demande part depuis votre propre messagerie, vers {SALON.email}. Nous nous en servons seulement pour vous répondre et préparer la visite. Ce formulaire n&apos;enregistre rien chez nous ; votre brouillon reste sur cet appareil.
        </p>
        {erreur && <p className="ed-erreur" role="alert">{erreur}</p>}
        <button className="btn btn-rose" type="submit">
          <i className="ti ti-send" aria-hidden="true" /> Préparer ma demande
        </button>
        <p className="ed-aide">Une candidature n&apos;engage à rien : on se voit, on vérifie les pièces, puis vous décidez.</p>
      </fieldset>
    </form>
  );
}

function Champ({ label, valeur, onChange, requis, inputMode, note }) {
  return (
    <label className="ed-champ">
      <span>
        {label}
        {requis && <em aria-hidden="true"> *</em>}
      </span>
      <input value={valeur} onChange={(e) => onChange(e.target.value)} inputMode={inputMode} required={requis} />
      {note && <small className="ed-erreur">{note}</small>}
    </label>
  );
}

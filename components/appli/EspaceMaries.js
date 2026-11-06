"use client";

// L'espace des mariés : créer l'appli, puis la modifier avec le lien privé.
// Adresse du lien privé : /appli-du-mariage/modifier/?m=<mariage>#k=<clé>. Sans clé, rien ne s'ouvre.

import { useEffect, useState } from "react";
import Link from "next/link";
import Formulaire from "./Formulaire";
import QrCode from "./QrCode";
import { mariageVide, nettoyer, manques, liensRefuses, LIMITES, dateLisible } from "../../lib/appli/contenu";
import { creerMariage, ouvrirMariage, modifierMariage, annoncer, supprimerMariage, MODE } from "../../lib/appli/stockage";
import { PREFIXE } from "../../lib/chemin";

const BROUILLON = "pm:brouillon";
const stock = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
  del: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

const enMin = (h) => {
  if (!h) return 9999;
  const [a, b] = h.split(":").map(Number);
  const m = a * 60 + b;
  return m < 360 ? m + 1440 : m;
};
// Le programme rangé dans l'ordre des heures, les lignes vides retirées.
function ranger(c) {
  const m = nettoyer(c);
  m.programme = m.programme.filter((p) => p.titre).sort((a, b) => enMin(a.heure) - enMin(b.heure));
  m.infos = m.infos.filter((i) => i.titre && i.texte);
  return m;
}

const liens = (slug, code, cle) => {
  const base = `${window.location.origin}${PREFIXE}`;
  return {
    invites: `${base}/mariage/?m=${slug}#c=${code}`,
    prive: `${base}/appli-du-mariage/modifier/?m=${slug}#k=${cle}`,
  };
};

async function copier(texte) {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    return false;
  }
}

export function CreerAppli() {
  const [m, setM] = useState(null);
  const [accord, setAccord] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [cree, setCree] = useState(null);

  useEffect(() => {
    let b = null;
    try {
      b = JSON.parse(stock.get(BROUILLON) || "null");
    } catch {}
    setM(b ? nettoyer(b) : mariageVide());
  }, []);

  useEffect(() => {
    if (m && !cree) stock.set(BROUILLON, JSON.stringify(m));
  }, [m, cree]);

  if (!m) return <p className="ed-attente">Ouverture…</p>;

  if (cree) return <Partage {...cree} premiere />;

  const manque = manques(nettoyer(m));

  return (
    <form
      className="ed"
      onSubmit={async (e) => {
        e.preventDefault();
        setErreur("");
        if (manque.length) return setErreur(`Il manque ${manque.join(", ")}.`);
        const refuses = liensRefuses(m);
        if (refuses.length) return setErreur(`Ces liens doivent commencer par https:// : ${refuses.join(", ")}.`);
        if (!accord) return setErreur("Cochez la case sur vos données pour continuer.");
        setEnvoi(true);
        try {
          const c = ranger(m);
          const r = await creerMariage(c);
          stock.set(`pm:cle:${r.slug}`, r.cle);
          stock.del(BROUILLON);
          setCree({ ...r, prenoms: c.prenoms, date: c.date });
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (er) {
          setErreur(er.message || "L'enregistrement n'a pas marché. Réessayez.");
        } finally {
          setEnvoi(false);
        }
      }}
    >
      {MODE === "essai" && <ModeEssai />}
      <p className="ed-aide">Votre brouillon se garde tout seul sur cet appareil. Seuls les champs marqués * sont obligatoires : le reste peut attendre.</p>
      <Formulaire valeur={m} onChange={setM} />
      <div className="ed-final">
        <label className="ed-accord">
          <input type="checkbox" checked={accord} onChange={(e) => setAccord(e.target.checked)} />
          <span>
            Nous acceptons que ces informations soient hébergées par PIX-I-ART pour faire fonctionner l&apos;appli. Elles sont visibles seulement avec le code du faire-part et effacées 90 jours après le mariage.{" "}
            <Link href="/appli-du-mariage/confidentialite/">Le détail</Link>
          </span>
        </label>
        {erreur && <p className="ed-erreur" role="alert">{erreur}</p>}
        <button className="btn btn-rose" type="submit" disabled={envoi}>
          {envoi ? "Création…" : "Créer l'appli de notre mariage"}
        </button>
      </div>
    </form>
  );
}

function ModeEssai() {
  return (
    <p className="ed-essai">
      <i className="ti ti-flask" aria-hidden="true" /> Mode essai : l&apos;appli s&apos;enregistre seulement dans ce navigateur. Vos invités ne la verront pas encore sur leur téléphone.
    </p>
  );
}

function Partage({ slug, code, cle, prenoms, date, premiere }) {
  const [l, setL] = useState(null);
  const [copie, setCopie] = useState("");
  useEffect(() => setL(liens(slug, code, cle)), [slug, code, cle]);
  if (!l) return null;
  const mail = `mailto:?subject=${encodeURIComponent(`Notre appli de mariage, le lien privé`)}&body=${encodeURIComponent(
    `Le lien privé pour modifier l'appli (à ne pas transmettre) :\n${l.prive}\n\nLe lien des invités :\n${l.invites}\nCode du faire-part : ${code}\n`
  )}`;
  const fait = async (quoi, texte) => {
    if (await copier(texte)) {
      setCopie(quoi);
      setTimeout(() => setCopie(""), 2500);
    }
  };
  return (
    <div className="ed-partage">
      {premiere && (
        <div className="ed-bravo">
          <h2>L&apos;appli de {prenoms[0]} &amp; {prenoms[1]} est prête</h2>
          <p>{dateLisible(date)}</p>
        </div>
      )}
      <section className="ed-bloc">
        <h3>Pour vos invités</h3>
        <p className="ed-aide">Imprimez le QR code sur le faire-part, avec le code en dessous. Ou envoyez le lien : il contient déjà le code.</p>
        <div className="ed-qr">
          <QrCode texte={l.invites} nomFichier={`qr-mariage-${prenoms.join("-").toLowerCase()}.png`} />
          <div className="ed-code">
            <span>Code du faire-part</span>
            <b>{code}</b>
          </div>
        </div>
        <div className="ed-copie">
          <input readOnly value={l.invites} aria-label="Lien des invités" onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fait("invites", l.invites)}>
            {copie === "invites" ? "Copié" : "Copier"}
          </button>
        </div>
        <a className="btn btn-ghost btn-sm" href={l.invites} target="_blank" rel="noopener noreferrer">
          <i className="ti ti-eye" aria-hidden="true" /> Voir comme un invité
        </a>
      </section>
      <section className="ed-bloc ed-prive">
        <h3>Votre lien privé, pour modifier</h3>
        <p className="ed-aide">
          <b>Gardez-le pour vous deux.</b> Quiconque l&apos;a peut modifier l&apos;appli. Il n&apos;y a pas de mot de passe : si vous le perdez, nous ne pourrons pas le retrouver.
        </p>
        <div className="ed-copie">
          <input readOnly value={l.prive} aria-label="Lien privé" onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fait("prive", l.prive)}>
            {copie === "prive" ? "Copié" : "Copier"}
          </button>
        </div>
        <div className="ed-puces">
          <a className="btn btn-gold btn-sm" href={mail}>
            <i className="ti ti-mail" aria-hidden="true" /> M&apos;envoyer les liens par mail
          </a>
          {premiere && (
            <a className="btn btn-ghost btn-sm" href={l.prive}>
              Continuer à remplir
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export function ModifierAppli() {
  const [etat, setEtat] = useState("chargement"); // chargement · sans-cle · pret · supprime
  const [slug, setSlug] = useState("");
  const [cle, setCle] = useState("");
  const [m, setM] = useState(null);
  const [code, setCode] = useState("");
  const [annonce, setAnnonce] = useState("");
  const [annonceEnLigne, setAnnonceEnLigne] = useState("");
  const [msg, setMsg] = useState({ texte: "", type: "" });
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("m") || "";
    const k = new URLSearchParams(window.location.hash.slice(1)).get("k") || (s ? stock.get(`pm:cle:${s}`) : "") || "";
    if (!/^[a-z0-9-]{1,80}$/.test(s) || !k) return setEtat("sans-cle");
    setSlug(s);
    setCle(k);
    ouvrirMariage(s, k)
      .then((r) => {
        if (!r) return setEtat("sans-cle");
        stock.set(`pm:cle:${s}`, k);
        setM(r.contenu);
        setCode(r.code);
        setAnnonce(r.annonce || "");
        setAnnonceEnLigne(r.annonce || "");
        setEtat("pret");
      })
      .catch((e) => {
        setMsg({ texte: e.message, type: "erreur" });
        setEtat("sans-cle");
      });
  }, []);

  const [msgAnnonce, setMsgAnnonce] = useState({ texte: "", type: "" });
  const direAnnonce = (texte, type = "ok") => {
    setMsgAnnonce({ texte, type });
    if (type === "ok") setTimeout(() => setMsgAnnonce({ texte: "", type: "" }), 3500);
  };
  const dire = (texte, type = "ok") => {
    setMsg({ texte, type });
    if (type === "ok") setTimeout(() => setMsg({ texte: "", type: "" }), 3500);
  };

  if (etat === "chargement") return <p className="ed-attente">Ouverture de votre appli…</p>;
  if (etat === "supprime")
    return (
      <div className="ed-bloc ed-centre">
        <h2>L&apos;appli est effacée</h2>
        <p className="ed-aide">Tout ce qu&apos;elle contenait a été supprimé. Le lien des invités ne mène plus nulle part.</p>
        <Link className="btn btn-rose" href="/">Retour au salon</Link>
      </div>
    );
  if (etat === "sans-cle")
    return (
      <div className="ed-bloc ed-centre">
        <h2>Ce lien ne s&apos;ouvre pas</h2>
        <p className="ed-aide">{msg.texte || "Ouvrez le lien privé reçu à la création de votre appli, en entier. Il se termine par une longue suite de lettres."}</p>
        <Link className="btn btn-rose" href="/appli-du-mariage/creer/">Créer une appli</Link>
      </div>
    );

  const manque = manques(nettoyer(m));

  return (
    <div className="ed">
      {MODE === "essai" && <ModeEssai />}

      <section className="ed-bloc ed-annonce">
        <h3><i className="ti ti-speakerphone" aria-hidden="true" /> Un mot à tous les invités, tout de suite</h3>
        <p className="ed-aide">Le jour J : « La cérémonie passe sous le kiosque, même heure. » Le mot s&apos;affiche en haut de l&apos;appli, chez tout le monde, en moins d&apos;une minute.</p>
        <label className="ed-champ">
          <span>Votre mot ({annonce.length}/{LIMITES.annonce})</span>
          <textarea rows={2} maxLength={LIMITES.annonce} value={annonce} onChange={(e) => setAnnonce(e.target.value)} />
        </label>
        {msgAnnonce.texte && (
          <p className={msgAnnonce.type === "erreur" ? "ed-erreur" : "ed-ok"} role={msgAnnonce.type === "erreur" ? "alert" : "status"}>
            {msgAnnonce.texte}
          </p>
        )}
        <div className="ed-puces">
          <button
            type="button"
            className="btn btn-rose btn-sm"
            disabled={occupe || !annonce.trim() || annonce.trim() === annonceEnLigne}
            onClick={async () => {
              setOccupe(true);
              try {
                await annoncer(slug, cle, annonce);
                setAnnonceEnLigne(annonce.trim());
                direAnnonce(MODE === "essai" ? "Le mot est affiché (sur cet appareil, en mode essai)." : "Le mot est affiché chez les invités.");
              } catch (e) {
                direAnnonce(e.message, "erreur");
              } finally {
                setOccupe(false);
              }
            }}
          >
            Afficher ce mot
          </button>
          {annonceEnLigne && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={occupe}
              onClick={async () => {
                setOccupe(true);
                try {
                  await annoncer(slug, cle, "");
                  setAnnonce("");
                  setAnnonceEnLigne("");
                  direAnnonce("Le mot est retiré.");
                } catch (e) {
                  direAnnonce(e.message, "erreur");
                } finally {
                  setOccupe(false);
                }
              }}
            >
              Retirer le mot affiché
            </button>
          )}
        </div>
      </section>

      <details className="ed-details">
        <summary>Le lien des invités, le QR code et votre lien privé</summary>
        <Partage slug={slug} code={code} cle={cle} prenoms={m.prenoms} date={m.date} />
      </details>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (manque.length) return dire(`Il manque ${manque.join(", ")}.`, "erreur");
          const refuses = liensRefuses(m);
          if (refuses.length) return dire(`Ces liens doivent commencer par https:// : ${refuses.join(", ")}.`, "erreur");
          setOccupe(true);
          try {
            const c = ranger(m);
            await modifierMariage(slug, cle, c);
            setM(c);
            dire("Enregistré. Les invités voient la nouvelle version.");
          } catch (er) {
            dire(er.message, "erreur");
          } finally {
            setOccupe(false);
          }
        }}
      >
        <Formulaire valeur={m} onChange={setM} />
        <div className="ed-final ed-collant">
          {msg.texte && (
            <p className={msg.type === "erreur" ? "ed-erreur" : "ed-ok"} role={msg.type === "erreur" ? "alert" : "status"}>
              {msg.texte}
            </p>
          )}
          <button className="btn btn-rose" type="submit" disabled={occupe}>
            {occupe ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>

      <section className="ed-bloc ed-effacer">
        <h3>Effacer l&apos;appli</h3>
        <p className="ed-aide">Elle s&apos;efface toute seule 90 jours après le mariage. Vous pouvez aussi l&apos;effacer maintenant : c&apos;est définitif.</p>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={occupe}
          onClick={async () => {
            if (!window.confirm("Effacer définitivement l'appli de votre mariage ? Vos invités ne pourront plus l'ouvrir.")) return;
            setOccupe(true);
            try {
              await supprimerMariage(slug, cle);
              stock.del(`pm:cle:${slug}`);
              setEtat("supprime");
            } catch (e) {
              dire(e.message, "erreur");
            } finally {
              setOccupe(false);
            }
          }}
        >
          <i className="ti ti-trash" aria-hidden="true" /> Effacer définitivement
        </button>
      </section>
    </div>
  );
}

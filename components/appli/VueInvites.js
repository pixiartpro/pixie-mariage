"use client";

// La page des invités : avant, le jour J, après.
// Adresse : /mariage/?m=<mariage>#c=<code du faire-part>. Le code ne part jamais dans l'adresse envoyée au serveur.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { lireMariage, MODE } from "../../lib/appli/stockage";
import {
  phase as calculerPhase,
  joursRestants,
  momentEnCours,
  heureLisible,
  dateLisible,
  lienItineraire,
  fichierAgenda,
} from "../../lib/appli/contenu";
import { prestataireBySlug, catByKey } from "../../lib/data";
import Installer from "./Installer";
import { PREFIXE } from "../../lib/chemin";

// Le site vers lequel part un bouton : affiché à côté, pour que personne ne soit envoyé ailleurs sans le voir.
const site = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
const Dest = ({ lien }) => (site(lien) ? <small className="ap-dest">{site(lien)}</small> : null);

const lireHash = () => {
  const h = new URLSearchParams(window.location.hash.slice(1));
  return h.get("c") || "";
};
const memo = {
  get: (k) => {
    try {
      return localStorage.getItem(k) || "";
    } catch {
      return "";
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

export default function VueInvites() {
  const [slug, setSlug] = useState(null);
  const [etat, setEtat] = useState("chargement"); // chargement · sans-lien · code · pret · erreur
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState("");
  const [saisie, setSaisie] = useState("");
  const [onglet, setOnglet] = useState(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const barre = useRef(null);
  const codeOk = useRef("");
  const [colle, setColle] = useState("");
  // Changer d'onglet remonte au début du contenu, au lieu de rester au milieu de l'ancien.
  const choisir = (k) => {
    if (k === onglet) return;
    setOnglet(k);
    const el = barre.current;
    if (el) {
      const haut = el.offsetTop - 8;
      if (window.scrollY > haut) window.scrollTo({ top: haut });
    }
  };

  const charger = useCallback(async (s, code, silencieux) => {
    try {
      const r = await lireMariage(s, code);
      if (!r) {
        if (!silencieux) {
          setEtat("code");
          if (code) setErreur("Ce code ne correspond pas. Il est écrit sur le faire-part.");
        }
        return;
      }
      codeOk.current = code;
      if (s !== "demo") {
        memo.set(`pm:code:${s}`, code);
        memo.set("pm:dernier", s);
      }
      setDonnees(r);
      setEtat("pret");
      setErreur("");
    } catch (e) {
      if (!silencieux) {
        setErreur(e.message);
        setEtat("erreur");
      }
    }
  }, []);

  // Ouverture : le mariage vient de l'adresse, ou du dernier ouvert (appli installée sur l'écran d'accueil).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("m") || memo.get("pm:dernier");
    if (!s || !/^[a-z0-9-]{1,80}$/.test(s)) {
      setEtat("sans-lien");
      return;
    }
    setSlug(s);
    const code = lireHash() || memo.get(`pm:code:${s}`);
    if (s === "demo" || code) charger(s, code);
    else setEtat("code");
  }, [charger]);

  // L'heure avance : le moment en cours et l'annonce des mariés se mettent à jour toutes les minutes.
  useEffect(() => {
    if (etat !== "pret") return;
    const id = setInterval(() => {
      setMaintenant(Date.now());
      if (document.visibilityState === "visible" && slug !== "demo") charger(slug, codeOk.current, true);
    }, 60000);
    return () => clearInterval(id);
  }, [etat, slug, charger]);

  if (etat === "chargement") return <Coque><p className="ap-attente">Ouverture de l&apos;appli du mariage…</p></Coque>;

  if (etat === "sans-lien")
    return (
      <Coque>
        <div className="ap-carte ap-centre">
          <h1 className="ap-h">L&apos;appli du mariage</h1>
          <p className="ap-sous">Ouvrez le lien ou le QR code reçu avec votre faire-part : il mène directement au mariage.</p>
          <form
            className="ap-colle"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const u = new URL(colle.trim());
                const s = u.searchParams.get("m") || "";
                const c = new URLSearchParams(u.hash.slice(1)).get("c") || "";
                if (!/^[a-z0-9-]{1,80}$/.test(s)) throw new Error();
                setSlug(s);
                setEtat("chargement");
                if (s === "demo" || c) charger(s, c);
                else setEtat("code");
              } catch {
                setErreur("Ce lien ne ressemble pas au lien du faire-part.");
              }
            }}
          >
            <label className="ap-label" htmlFor="colle">Ou collez ici le lien reçu</label>
            <input id="colle" className="ap-champ" value={colle} onChange={(e) => setColle(e.target.value)} inputMode="url" autoComplete="off" placeholder="https://…" />
            {erreur && <p className="ap-erreur" role="alert">{erreur}</p>}
            <button className="ap-btn ap-btn-clair" type="submit">Ouvrir ce lien</button>
          </form>
          <a className="ap-btn" href={`${PREFIXE}/mariage/?m=demo`}>Voir un mariage de démonstration</a>
          <Link className="ap-lien" href="/appli-du-mariage/">Vous vous mariez ? Créez la vôtre, gratuitement</Link>
        </div>
      </Coque>
    );

  if (etat === "code" || etat === "erreur")
    return (
      <Coque>
        <form
          className="ap-carte ap-centre"
          onSubmit={(e) => {
            e.preventDefault();
            setEtat("chargement");
            charger(slug, saisie.trim().toUpperCase());
          }}
        >
          <h1 className="ap-h">Le code du faire-part</h1>
          <p className="ap-sous">Les mariés l&apos;ont écrit sur votre invitation, à côté du QR code.</p>
          <label className="ap-label" htmlFor="code">Code</label>
          <input
            id="code"
            className="ap-code"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            required
          />
          {erreur && <p className="ap-erreur" role="alert">{erreur}</p>}
          <button className="ap-btn" type="submit">Ouvrir</button>
        </form>
      </Coque>
    );

  const m = donnees.contenu;
  const phaseReelle = calculerPhase(m.date, maintenant);
  const vue = onglet || phaseReelle;
  const restants = joursRestants(m.date, maintenant);
  const titreCompte =
    vue === "avant"
      ? phaseReelle === "avant"
        ? restants === 1
          ? "C'est demain"
          : `Dans ${restants} jours`
        : "Le programme"
      : vue === "jour"
        ? phaseReelle === "jour"
          ? "C'est aujourd'hui"
          : "Le jour J"
        : "Merci d'avoir été là";
  let enCours = momentEnCours(m.programme, m.date, maintenant);
  if (donnees.demo && vue === "jour" && enCours === null) enCours = 2;

  const telechargerAgenda = () => {
    const ics = fichierAgenda(m, window.location.href.split("#")[0]);
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mariage.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Coque>
      {donnees.demo && <p className="ap-demo">Démonstration · mariage et prestataires inventés</p>}
      {!donnees.demo && MODE === "essai" && <p className="ap-demo">Mode essai · visible seulement sur cet appareil</p>}

      <header className="ap-fairepart">
        <span className="ap-k">Le mariage de</span>
        <h1>
          {m.prenoms[0]} <span className="ap-esp">&amp;</span> {m.prenoms[1]}
        </h1>
        <p className="ap-quand">
          {dateLisible(m.date)}
          {m.lieu.nom ? ` · ${m.lieu.nom}` : ""}
          {m.lieu.ville ? `, ${m.lieu.ville}` : ""}
        </p>
        <p className="ap-compte">{titreCompte}</p>
      </header>

      {donnees.annonce && (
        <div className="ap-annonce" role="status">
          <span className="ap-annonce-ic" aria-hidden="true"><i className="ti ti-speakerphone" /></span>
          <div>
            <b>Un mot des mariés</b>
            <span>{donnees.annonce}</span>
          </div>
        </div>
      )}

      <div ref={barre} aria-hidden="true" />
      <div className="ap-phases" role="tablist" aria-label="Moment du mariage">
        {[
          ["avant", "Avant"],
          ["jour", "Le jour J"],
          ["apres", "Après"],
        ].map(([k, t]) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={vue === k}
            onClick={() => choisir(k)}
          >
            {t}
          </button>
        ))}
      </div>

      {vue === "avant" && (
        <div className="ap-vue">
          <Lieu m={m} onAgenda={telechargerAgenda} />
          <Programme m={m} enCours={null} />
          {(m.reponse.lien || m.reponse.avant_le) && (
            <section className="ap-carte">
              <h2>Vous venez ?</h2>
              <p className="ap-sous">
                {m.reponse.avant_le ? `Les mariés attendent votre réponse avant le ${dateLisible(m.reponse.avant_le).toLowerCase()}.` : "Les mariés attendent votre réponse."}
              </p>
              {m.reponse.lien && (
                <a className="ap-btn" href={m.reponse.lien} target="_blank" rel="noopener noreferrer">Répondre aux mariés <Dest lien={m.reponse.lien} /></a>
              )}
            </section>
          )}
          {m.conseil && (
            <section className="ap-carte">
              <h2>Un conseil des mariés</h2>
              <p className="ap-sous">{m.conseil}</p>
            </section>
          )}
        </div>
      )}

      {vue === "jour" && (
        <div className="ap-vue">
          <Programme m={m} enCours={enCours} titre="Où on en est" />
          <section className="ap-carte">
            <h2>Y aller</h2>
            <a className="ap-btn" href={lienItineraire(m.lieu)} target="_blank" rel="noopener noreferrer">
              <i className="ti ti-route" aria-hidden="true" /> Itinéraire vers {m.lieu.nom || "le lieu"}
            </a>
            {m.infos.filter((i) => i.texte).length > 0 && <Infos infos={m.infos} />}
          </section>
          {m.photos_soir && (
            <section className="ap-carte">
              <h2>Partagez vos photos</h2>
              <p className="ap-sous">L&apos;album partagé choisi par les mariés. Ils décident ensuite de ce qui reste.</p>
              <a className="ap-btn" href={m.photos_soir} target="_blank" rel="noopener noreferrer">
                <i className="ti ti-camera-plus" aria-hidden="true" /> Ajouter mes photos <Dest lien={m.photos_soir} />
              </a>
            </section>
          )}
        </div>
      )}

      {vue === "apres" && (
        <div className="ap-vue">
          {m.apres.merci && (
            <section className="ap-carte">
              <p className="ap-merci">« {m.apres.merci} » <span>{m.prenoms[0]} &amp; {m.prenoms[1]}</span></p>
            </section>
          )}
          {(m.apres.teaser || m.apres.film) && (
            <section className="ap-carte">
              <h2>Le film</h2>
              <div className="ap-btns">
                {m.apres.teaser && <a className="ap-btn" href={m.apres.teaser} target="_blank" rel="noopener noreferrer"><i className="ti ti-player-play" aria-hidden="true" /> Le teaser <Dest lien={m.apres.teaser} /></a>}
                {m.apres.film && <a className="ap-btn" href={m.apres.film} target="_blank" rel="noopener noreferrer"><i className="ti ti-movie" aria-hidden="true" /> Le film complet <Dest lien={m.apres.film} /></a>}
              </div>
            </section>
          )}
          {(m.apres.galerie || m.photos_soir) && (
            <section className="ap-carte">
              <h2>Les photos</h2>
              <div className="ap-btns">
                {m.apres.galerie && <a className="ap-btn" href={m.apres.galerie} target="_blank" rel="noopener noreferrer">La galerie du photographe <Dest lien={m.apres.galerie} /></a>}
                {m.photos_soir && <a className="ap-btn ap-btn-clair" href={m.photos_soir} target="_blank" rel="noopener noreferrer">L&apos;album des invités <Dest lien={m.photos_soir} /></a>}
              </div>
            </section>
          )}
          {!m.apres.merci && !m.apres.teaser && !m.apres.film && !m.apres.galerie && (
            <section className="ap-carte">
              <h2>Après le mariage</h2>
              <p className="ap-sous">Le mot des mariés, le film et les photos arriveront ici, au même endroit, dans les jours et les semaines qui suivent.</p>
            </section>
          )}
          <Prestataires m={m} />
          {m.apres.tirages && (
            <section className="ap-carte">
              <h2>Commander vos tirages</h2>
              <p className="ap-sous">Le lien donné par les mariés, vers le site de leur photographe. Pixie Mariage ne vend rien et n&apos;encaisse rien.</p>
              <a className="ap-btn ap-btn-clair" href={m.apres.tirages} target="_blank" rel="noopener noreferrer">
                Commander <Dest lien={m.apres.tirages} />
              </a>
            </section>
          )}
        </div>
      )}

      <Installer />
      <p className="ap-pied">
        L&apos;appli du mariage · <Link href="/">Pixie Mariage</Link>, un Monde Pixie
        {" · "}
        <Link href="/appli-du-mariage/confidentialite/">Vos données</Link>
      </p>
    </Coque>
  );
}

function Coque({ children }) {
  return <div className="ap">{children}</div>;
}

function Infos({ infos }) {
  const pleines = infos.filter((i) => i.titre && i.texte);
  if (!pleines.length) return null;
  return (
    <dl className="ap-infos">
      {pleines.map((i, k) => (
        <div key={k}>
          <dt>{i.titre}</dt>
          <dd>{i.texte}</dd>
        </div>
      ))}
    </dl>
  );
}

function Lieu({ m, onAgenda }) {
  return (
    <section className="ap-carte">
      <h2>Le lieu en un appui</h2>
      <p className="ap-sous">
        {[m.lieu.nom, m.lieu.adresse, m.lieu.ville].filter(Boolean).join(", ")}
      </p>
      <div className="ap-btns">
        <a className="ap-btn" href={lienItineraire(m.lieu)} target="_blank" rel="noopener noreferrer">
          <i className="ti ti-route" aria-hidden="true" /> Itinéraire
        </a>
        <button className="ap-btn ap-btn-clair" type="button" onClick={onAgenda}>
          <i className="ti ti-calendar-plus" aria-hidden="true" /> Agenda
        </button>
      </div>
      <Infos infos={m.infos} />
    </section>
  );
}

function Programme({ m, enCours, titre = "Le programme" }) {
  const lignes = m.programme.filter((p) => p.titre);
  if (!lignes.length) return null;
  return (
    <section className="ap-carte">
      <h2>{titre}</h2>
      <ol className="ap-prog">
        {lignes.map((p, i) => {
          const cls = enCours === null || enCours === undefined ? "" : i < enCours ? "fait" : i === enCours ? "maintenant" : "";
          return (
            <li key={i} className={cls} aria-current={cls === "maintenant" ? "time" : undefined}>
              <span className="ap-h-prog">{heureLisible(p.heure)}</span>
              <div>
                <b>
                  {p.titre}
                  {cls === "maintenant" && <span className="ap-now">maintenant</span>}
                </b>
                {p.detail && <span>{p.detail}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Prestataires({ m }) {
  if (!m.prestataires.length) return null;
  return (
    <section className="ap-carte">
      <h2>Les prestataires de ce mariage</h2>
      <p className="ap-sous">Vous avez aimé le lieu, le repas, les fleurs ? Retrouvez-les.</p>
      <ul className="ap-prest">
        {m.prestataires.map((p, i) => {
          if (p.slug) {
            const f = prestataireBySlug(p.slug);
            if (!f)
              return p.role ? (
                <li key={i}>
                  <div className="ap-prest-sans">
                    <div>
                      <b>{p.role}</b>
                      <span>Prestataire qui n&apos;est plus au salon</span>
                    </div>
                  </div>
                </li>
              ) : null;
            const cat = catByKey(f.categorie);
            return (
              <li key={i}>
                <Link
                  href={`/prestataire/${f.slug}/`}
                  onClick={() => {
                    try {
                      sessionStorage.setItem("pm:depuis-mariage", f.slug);
                    } catch {}
                  }}
                >
                  <div>
                    <b>{f.nom}</b>
                    <span>{p.role || (cat ? cat.nom : "")} · {f.ville}</span>
                  </div>
                  <i>Voir le stand</i>
                </Link>
              </li>
            );
          }
          const contenu = (
            <div>
              <b>{p.nom}</b>
              {p.role && <span>{p.role}</span>}
            </div>
          );
          return (
            <li key={i}>
              {p.lien ? (
                <a href={p.lien} target="_blank" rel="noopener noreferrer">
                  {contenu}
                  <i>{site(p.lien) || "Son site"}</i>
                </a>
              ) : (
                <div className="ap-prest-sans">{contenu}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

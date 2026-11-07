"use client";

// L'espace pro, en démonstration : l'agenda, les demandes des couples et les mariages d'un prestataire,
// relié à l'appli des mariés. Tout est inventé ; rien n'est enregistré ni envoyé.
// Adresse : /espace-pro/ ; l'onglet ouvert peut se mettre dans l'adresse (#agenda, #demandes, #mariages).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SALON, catByKey, prestataireBySlug } from "../../lib/data";
import { catGrad } from "../../lib/theme";
import { SITE } from "../../lib/chemin";
import { MARIAGE_DEMO } from "../../lib/appli/demo";
import { PRO_DEMO, etatDemoPro } from "../../lib/appli/demo-pro";
import { nettoyer, maintenantReunion, dateLisible, joursRestants, heureLisible } from "../../lib/appli/contenu";
import {
  grilleMois,
  moisSuivant,
  estSamedi,
  etatJour,
  dispo,
  basculerLibre,
  samedisACocher,
  cocherSamedis,
  changerEtape,
  ETAPES,
  demandeEnCours,
  aVenir,
  passes,
  resume,
  ilYa,
  prenomsDe,
  deCouple,
  messageOffrirAppli,
} from "../../lib/appli/pro";

const ONGLETS = [
  { cle: "agenda", nom: "Agenda" },
  { cle: "demandes", nom: "Demandes" },
  { cle: "mariages", nom: "Mariages" },
];
const ENTETE = ["L", "M", "M", "J", "V", "S", "D"];
const ENTETE_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const midi = (iso) => new Date(iso + "T12:00:00Z");
const fr = (opts) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...opts });
const nomDuMois = ({ annee, mois }) => fr({ month: "long" }).format(new Date(Date.UTC(annee, mois - 1, 1, 12)));
const dateCourte = (iso) => fr({ day: "numeric", month: "long" }).format(midi(iso));
const moisCourt = (iso) => fr({ month: "short" }).format(midi(iso)).replace(".", "");
const enJours = (n) => (n === 0 ? "aujourd'hui" : n === 1 ? "demain" : n > 1 ? `dans ${n} jours` : "passé");
const lieuDe = (m) => [m.lieu?.nom, m.lieu?.ville].filter(Boolean).join(", ");
const nomEtape = (cle) => ETAPES.find((e) => e.cle === cle)?.nom || "";
const moisDe = (iso) => ({ annee: +iso.slice(0, 4), mois: +iso.slice(5, 7) });

export default function EspacePro() {
  const fiche = prestataireBySlug(PRO_DEMO.stand);
  const [auj, setAuj] = useState(null);
  const [etat, setEtat] = useState(null);
  const [onglet, setOnglet] = useState("agenda");
  const [mois, setMois] = useState(null);
  const [jourVu, setJourVu] = useState(null);
  const [deplie, setDeplie] = useState(null);
  const [retour, setRetour] = useState(null);
  const [mariageOuvert, setMariageOuvert] = useState(null);
  const ancre = useRef(null);

  // Le jour se lit dans le navigateur : la page est construite à l'avance, pas le jour où on l'ouvre.
  useEffect(() => {
    const j = maintenantReunion().jour;
    setAuj(j);
    setEtat(etatDemoPro(j));
    setMois(moisDe(j));
    const h = window.location.hash.slice(1);
    if (ONGLETS.some((o) => o.cle === h)) setOnglet(h);
  }, []);

  if (!etat || !fiche) {
    return (
      <div className="ap">
        <p className="ap-attente">Ouverture de la démonstration…</p>
      </div>
    );
  }

  const aller = (cle, mariage = null) => {
    setOnglet(cle);
    setMariageOuvert(mariage);
    try {
      history.replaceState(null, "", `#${cle}`);
    } catch {}
    const haut = ancre.current ? ancre.current.getBoundingClientRect().top + window.scrollY : 0;
    if (window.scrollY > haut) window.scrollTo({ top: haut });
  };

  const toucherJour = (iso) => {
    if (etatJour(iso, etat, auj) === "reserve") return aller("mariages", etat.mariages.find((m) => m.date === iso)?.id || null);
    setEtat(basculerLibre(etat, iso, auj));
    setJourVu(iso);
  };

  const changer = (id, etape) => {
    const res = changerEtape(etat, id, etape, PRO_DEMO.role);
    if (res.erreur) return setRetour({ id, type: "erreur", texte: res.erreur });
    setEtat(res.etat);
    const d = res.etat.demandes.find((x) => x.id === id);
    setRetour(
      res.mariage
        ? { id, type: "ok", texte: `C'est noté : le mariage ${deCouple(d)} est dans « Mariages », et le ${dateCourte(d.date)} est réservé dans votre agenda.`, mariage: res.mariage.id }
        : null,
    );
  };

  const remettre = () => {
    setEtat(etatDemoPro(auj));
    setMois(moisDe(auj));
    setJourVu(null);
    setDeplie(null);
    setRetour(null);
    setMariageOuvert(null);
  };

  const r = resume(etat, auj);
  const n = r.prochain ? joursRestants(r.prochain.date) : null;
  const ouvertCeMariage = onglet === "mariages" && etat.mariages.find((m) => m.id === mariageOuvert);

  return (
    <div className="ap pro">
      <p className="ap-demo">Démonstration · tout est inventé</p>

      <header className="pro-tete">
        <p className="ap-label">Votre espace pro</p>
        <h1>{fiche.nom}</h1>
        <p className="ap-sous">
          {catByKey(fiche.categorie)?.nom} · {fiche.ville} ·{" "}
          <Link className="ap-lien" href={`/prestataire/${fiche.slug}/`}>
            voir mon stand
          </Link>
        </p>
      </header>

      <div className="pro-resume">
        <button type="button" onClick={() => aller("demandes")}>
          <b>{r.nouvelles}</b>
          <span>{r.nouvelles > 1 ? "nouvelles demandes" : "nouvelle demande"}</span>
        </button>
        <button type="button" onClick={() => aller("mariages", r.prochain?.id || null)}>
          {r.prochain ? (
            <>
              <b>{n === 0 ? "Jour J" : n}</b>
              <span>{n === 0 ? `le mariage ${deCouple(r.prochain)}` : `${n > 1 ? "jours" : "jour"} avant le mariage ${deCouple(r.prochain)}`}</span>
            </>
          ) : (
            <>
              <b>0</b>
              <span>mariage à venir</span>
            </>
          )}
        </button>
        <button type="button" onClick={() => aller("agenda")}>
          <b>{r.libres}</b>
          <span>{r.libres > 1 ? "dates libres cochées" : "date libre cochée"}</span>
        </button>
      </div>

      <div ref={ancre} />
      <div className="ap-phases pro-onglets" role="tablist" aria-label="Votre espace pro">
        {ONGLETS.map((o) => (
          <button key={o.cle} type="button" role="tab" id={`onglet-${o.cle}`} aria-controls="pro-vue" aria-selected={onglet === o.cle} onClick={() => aller(o.cle)}>
            {o.nom}
            {o.cle === "demandes" && r.nouvelles > 0 && (
              <span className="pro-pastille">
                <span className="sr">, nouvelles : </span>
                {r.nouvelles}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="ap-vue" role="tabpanel" id="pro-vue" aria-labelledby={`onglet-${onglet}`}>
        {onglet === "agenda" && (
          <Agenda etat={etat} auj={auj} mois={mois} setMois={setMois} toucher={toucherJour} cocher={() => setEtat(cocherSamedis(etat, mois.annee, mois.mois, auj))} jourVu={jourVu} fiche={fiche} />
        )}
        {onglet === "demandes" && (
          <Demandes
            etat={etat}
            auj={auj}
            deplie={deplie}
            basculer={(id) => {
              setDeplie(deplie === id ? null : id);
              setRetour(null);
            }}
            changer={changer}
            retour={retour}
            voir={(id) => aller("mariages", id)}
          />
        )}
        {onglet === "mariages" &&
          (ouvertCeMariage ? <FicheMariage m={ouvertCeMariage} fiche={fiche} fermer={() => aller("mariages")} /> : <ListeMariages etat={etat} auj={auj} ouvrir={(id) => aller("mariages", id)} />)}
      </div>

      <section className="ap-carte pro-fin">
        <h2>Cet outil vous servirait&nbsp;?</h2>
        <p className="ap-sous">L&apos;espace pro est en préparation pour les exposants du salon. On le construit si les pros le demandent.</p>
        <a className="ap-btn" href={`mailto:${SALON.email}?subject=${encodeURIComponent("Je veux l'espace pro")}`}>
          <i className="ti ti-mail" aria-hidden="true" /> Je le veux
        </a>
      </section>
      <p className="pro-pied">
        Démonstration : rien n&apos;est enregistré ni envoyé.{" "}
        <button type="button" className="pro-raz" onClick={remettre}>
          Tout remettre à zéro
        </button>
      </p>
    </div>
  );
}

function Agenda({ etat, auj, mois, setMois, toucher, cocher, jourVu, fiche }) {
  const depart = moisDe(auj);
  const ecart = (mois.annee - depart.annee) * 12 + (mois.mois - depart.mois);
  const enCours = new Set(etat.demandes.filter(demandeEnCours).map((d) => d.date));
  const aCocher = samedisACocher(etat, mois.annee, mois.mois, auj).length;
  const leMois = nomDuMois(mois);
  // « Ce que voit un couple » : le dernier jour coché, sinon le prochain jour libre.
  const montre = jourVu && etatJour(jourVu, etat, auj) === "libre" ? jourVu : etat.libres.find((iso) => etatJour(iso, etat, auj) === "libre");

  return (
    <>
      <section className="ap-carte pro-agenda" aria-labelledby="pro-mois">
        <div className="pro-mois">
          <button type="button" className="pro-fleche" onClick={() => setMois(moisSuivant(mois, -1))} disabled={ecart <= 0} aria-label="Mois précédent">
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </button>
          <h2 id="pro-mois">
            {leMois.charAt(0).toUpperCase() + leMois.slice(1)} {mois.annee}
          </h2>
          <button type="button" className="pro-fleche" onClick={() => setMois(moisSuivant(mois, 1))} disabled={ecart >= 23} aria-label="Mois suivant">
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
        <table className="pro-cal">
          <thead>
            <tr>
              {ENTETE.map((j, i) => (
                <th key={i} scope="col" abbr={ENTETE_LONG[i]}>
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grilleMois(mois.annee, mois.mois).map((semaine, i) => (
              <tr key={i}>
                {semaine.map((iso, k) => (
                  <td key={k}>{iso && <Jour iso={iso} etat={etat} auj={auj} demande={enCours.has(iso)} toucher={toucher} />}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="pro-legende" aria-label="Légende">
          <li>
            <i className="pro-l pro-l-libre" aria-hidden="true" /> Libre
          </li>
          <li>
            <i className="pro-l pro-l-reserve" aria-hidden="true" /> Réservé
          </li>
          <li>
            <i className="pro-l pro-l-demande" aria-hidden="true" /> Demande en cours
          </li>
        </ul>
        <p className="ap-sous">Touchez un jour pour le dire libre. Touchez-le encore pour l&apos;enlever.</p>
        <button type="button" className="ap-btn ap-btn-clair" onClick={cocher} disabled={!aCocher}>
          <i className="ti ti-checks" aria-hidden="true" />
          {aCocher ? `Libre tous les samedis de ${leMois}` : `Samedis de ${leMois} : tous cochés ou réservés`}
        </button>
      </section>

      {montre && (
        <section className="ap-carte pro-vu" aria-live="polite">
          <p className="ap-label">Ce que voit un couple</p>
          <p className="pro-recherche">
            <i className="ti ti-search" aria-hidden="true" /> Un {PRO_DEMO.metier} libre le {dateLisible(montre).toLowerCase()}
          </p>
          <div className="pro-mini">
            <span className="pro-vignette" style={{ background: catGrad(fiche.categorie) }} aria-hidden="true" />
            <div>
              <b>{fiche.nom}</b>
              <span>
                {fiche.ville} · {fiche.prix}
              </span>
              <em>
                <i className="ti ti-circle-check" aria-hidden="true" /> Libre ce jour-là
              </em>
            </div>
          </div>
          <p className="ap-sous">Quand un couple cherche un {PRO_DEMO.metier} pour sa date, il voit tout de suite que vous êtes libre ce jour-là.</p>
        </section>
      )}
    </>
  );
}

function Jour({ iso, etat, auj, demande, toucher }) {
  const e = etatJour(iso, etat, auj);
  const m = e === "reserve" ? etat.mariages.find((x) => x.date === iso) : null;
  const quoi = e === "reserve" ? `réservé, mariage ${deCouple(m)}` : e === "libre" ? "libre" : e === "passe" ? "passé" : "pas coché";
  return (
    <button
      type="button"
      className={`pro-jour pro-j-${e}${estSamedi(iso) ? " sam" : ""}${iso === auj ? " auj" : ""}`}
      disabled={e === "passe"}
      aria-pressed={e === "libre" || e === "rien" ? e === "libre" : undefined}
      aria-label={`${dateLisible(iso)} : ${quoi}${demande ? ", une demande en cours" : ""}`}
      onClick={() => toucher(iso)}
    >
      {+iso.slice(8)}
      {demande && <i className="pro-point" aria-hidden="true" />}
    </button>
  );
}

function Demandes({ etat, auj, deplie, basculer, changer, retour, voir }) {
  // Toujours dans l'ordre d'arrivée : une demande ne saute pas ailleurs quand on change son étape.
  const liste = [...etat.demandes].sort((a, b) => b.recue.localeCompare(a.recue));
  const nouvelles = etat.demandes.filter((d) => d.etape === "nouvelle").length;
  const suivies = etat.demandes.filter((d) => d.etape === "repondu" || d.etape === "devis").length;
  return (
    <>
      <p className="ap-sous">Les demandes des couples arrivent ici, depuis votre stand. Vous voyez d&apos;un coup d&apos;œil si vous êtes libre, et où vous en êtes avec chacun.</p>
      <p className="pro-compte">
        {nouvelles} {nouvelles > 1 ? "nouvelles" : "nouvelle"} · {suivies} en cours
      </p>
      {liste.map((d) => (
        <CarteDemande key={d.id} d={d} etat={etat} auj={auj} ouverte={deplie === d.id} basculer={() => basculer(d.id)} changer={changer} retour={retour?.id === d.id ? retour : null} voir={voir} />
      ))}
    </>
  );
}

function CarteDemande({ d, etat, auj, ouverte, basculer, changer, retour, voir }) {
  const di = dispo(d.date, etat);
  const badge =
    di.etat === "pris" && di.mariage.demande === d.id
      ? { cls: "libre", ic: "heart", txt: "Réservé pour eux" }
      : di.etat === "pris"
        ? { cls: "pris", ic: "alert-circle", txt: `Déjà pris : mariage ${deCouple(di.mariage)}` }
        : di.etat === "libre"
          ? { cls: "libre", ic: "circle-check", txt: "Vous êtes libre ce jour-là" }
          : { cls: "inconnu", ic: "help-circle", txt: "Jour pas coché dans votre agenda" };
  return (
    <article className={`ap-carte pro-demande${d.etape === "sans-suite" ? " fini" : ""}`}>
      <button type="button" className="pro-demande-tete" aria-expanded={ouverte} aria-controls={`demande-${d.id}`} onClick={basculer}>
        <span className="pro-l1">
          <b>{prenomsDe(d)}</b>
          <span className={`pro-etape e-${d.etape}`}>{nomEtape(d.etape)}</span>
        </span>
        <span className="pro-l2">{dateLisible(d.date)}</span>
        <span className="pro-l3">{`${d.ville} · ${d.invites} invités · reçue ${ilYa(d.recue, auj)}`}</span>
        <span className="pro-l4">
          <span className={`pro-dispo d-${badge.cls}`}>
            <i className={`ti ti-${badge.ic}`} aria-hidden="true" /> {badge.txt}
          </span>
          <i className={`ti ti-chevron-${ouverte ? "up" : "down"}`} aria-hidden="true" />
        </span>
      </button>
      {ouverte && (
        <div className="pro-demande-corps" id={`demande-${d.id}`}>
          <p className="pro-message">{d.message}</p>
          <p className="ap-label">Où en êtes-vous avec eux ?</p>
          <div className="pro-etapes" role="group" aria-label={`Étape de la demande ${deCouple(d)}`}>
            {ETAPES.map((e) => (
              <button key={e.cle} type="button" aria-pressed={d.etape === e.cle} onClick={() => changer(d.id, e.cle)}>
                {e.nom}
              </button>
            ))}
          </div>
          {retour && (
            <p className={retour.type === "erreur" ? "ap-erreur" : "pro-ok"} role={retour.type === "erreur" ? "alert" : "status"}>
              {retour.texte}{" "}
              {retour.mariage && (
                <button type="button" className="pro-raz" onClick={() => voir(retour.mariage)}>
                  Voir le mariage
                </button>
              )}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function ListeMariages({ etat, auj, ouvrir }) {
  const avenir = aVenir(etat.mariages, auj);
  const anciens = passes(etat.mariages, auj);
  return (
    <>
      <p className="ap-sous">Quand des mariés vous ajoutent dans l&apos;appli de leur mariage, tout arrive ici : la date, le lieu, le programme et l&apos;équipe du jour.</p>
      {avenir.length ? (
        <ul className="pro-mariages">
          {avenir.map((m) => (
            <LigneMariage key={m.id} m={m} ouvrir={ouvrir} />
          ))}
        </ul>
      ) : (
        <p className="ap-sous">Aucun mariage à venir.</p>
      )}
      {anciens.length > 0 && (
        <>
          <h2 className="pro-titre">Mariages passés</h2>
          <ul className="pro-mariages">
            {anciens.map((m) => (
              <LigneMariage key={m.id} m={m} ouvrir={ouvrir} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function LigneMariage({ m, ouvrir }) {
  const d = midi(m.date);
  return (
    <li>
      <button type="button" className="pro-mariage" onClick={() => ouvrir(m.id)}>
        <span className="pro-date" aria-hidden="true">
          <b>{d.getUTCDate()}</b>
          <span>{moisCourt(m.date)}</span>
          <span>{d.getUTCFullYear()}</span>
        </span>
        <span className="pro-mariage-txt">
          <span className="sr">{dateLisible(m.date)} : </span>
          <b>{prenomsDe(m)}</b>
          <span>{[enJours(joursRestants(m.date)), m.lieu?.ville].filter(Boolean).join(" · ").replace(/^./, (c) => c.toUpperCase())}</span>
          <span className={m.appli ? "pro-oui" : "pro-non"}>
            <i className={`ti ti-${m.appli ? "link" : "gift"}`} aria-hidden="true" /> {m.appli ? "Appli du mariage reliée" : "Pas encore d'appli"}
          </span>
        </span>
        <i className="ti ti-chevron-right" aria-hidden="true" />
      </button>
    </li>
  );
}

function FicheMariage({ m, fiche, fermer }) {
  const appli = m.appli === "demo" ? nettoyer(MARIAGE_DEMO.contenu) : null;
  const n = joursRestants(m.date);
  const lieu = lieuDe(m);
  return (
    <>
      <button type="button" className="pro-retour" onClick={fermer}>
        <i className="ti ti-arrow-left" aria-hidden="true" /> Tous mes mariages
      </button>
      <header className="ap-fairepart">
        <span className="ap-k">{m.role ? `Votre rôle : ${m.role.toLowerCase()}` : "Votre mariage"}</span>
        <h2 className="pro-fp-noms">
          {m.prenoms[0]} <span className="ap-esp">&amp;</span> {m.prenoms[1]}
        </h2>
        <p className="ap-quand">
          {dateLisible(m.date)}
          {lieu ? ` · ${lieu}` : ""}
        </p>
        <p className="ap-compte">{n > 1 ? `Dans ${n} jours` : n === 1 ? "Demain" : n === 0 ? "C'est aujourd'hui" : "Mariage passé"}</p>
      </header>
      {appli ? <DepuisAppli appli={appli} m={m} fiche={fiche} /> : <SansAppli m={m} fiche={fiche} />}
    </>
  );
}

function DepuisAppli({ appli, m, fiche }) {
  const programme = appli.programme.filter((p) => p.titre);
  const infos = appli.infos.filter((x) => x.titre && x.texte);
  return (
    <>
      <p className="pro-relie">
        <i className="ti ti-link" aria-hidden="true" />
        <span>Tout vient de l&apos;appli {deCouple(m)}. S&apos;ils changent un horaire, vous le voyez ici, sans message à faire suivre.</span>
      </p>
      {programme.length > 0 && (
        <section className="ap-carte">
          <h2>Le programme</h2>
          <ol className="ap-prog">
            {programme.map((p, i) => (
              <li key={i}>
                <span className="ap-h-prog">{heureLisible(p.heure)}</span>
                <div>
                  <b>{p.titre}</b>
                  {p.detail && <span>{p.detail}</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
      {infos.length > 0 && (
        <section className="ap-carte">
          <h2>Sur place</h2>
          <dl className="ap-infos">
            {infos.map((x, i) => (
              <div key={i}>
                <dt>{x.titre}</dt>
                <dd>{x.texte}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {appli.conseil && (
        <section className="ap-carte">
          <h2>Le conseil des mariés</h2>
          <p className="ap-merci">{appli.conseil}</p>
        </section>
      )}
      {appli.prestataires.length > 0 && (
        <section className="ap-carte">
          <h2>L&apos;équipe du jour</h2>
          <ul className="ap-prest">
            {appli.prestataires.map((p, i) => {
              const f = p.slug ? prestataireBySlug(p.slug) : null;
              const nom = f?.nom || p.nom;
              if (!nom) return null;
              const moi = p.slug === fiche.slug;
              const role = p.role || (f ? catByKey(f.categorie)?.nom : "");
              return (
                <li key={i}>
                  {f && !moi ? (
                    <Link href={`/prestataire/${f.slug}/`}>
                      <div>
                        <b>{nom}</b>
                        <span>{role}</span>
                      </div>
                      <i>Voir le stand</i>
                    </Link>
                  ) : (
                    <div className="ap-prest-sans">
                      <div>
                        <b>{nom}</b>
                        <span>{role}</span>
                      </div>
                      {moi && <i>C&apos;est vous</i>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <Link className="ap-btn" href={`/mariage/?m=${encodeURIComponent(m.appli)}`}>
        <i className="ti ti-device-mobile" aria-hidden="true" /> Ouvrir l&apos;appli du mariage
      </Link>
      <p className="ap-sous pro-centre">C&apos;est l&apos;appli que voient les invités. Votre stand y est, avec les autres pros.</p>
    </>
  );
}

function SansAppli({ m, fiche }) {
  const [vu, setVu] = useState(false);
  const [copie, setCopie] = useState("");
  const texte = messageOffrirAppli(m.prenoms, fiche.nom, `${SITE}/appli-du-mariage/`);
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie("Copié. Collez-le dans WhatsApp, un SMS ou un mail.");
    } catch {
      setCopie("La copie n'a pas marché : sélectionnez le texte à la main.");
    }
  };
  return (
    <section className="ap-carte pro-offrir">
      <h2>Pas encore d&apos;appli</h2>
      {/* Phrase écrite d'un bloc : la construction mangeait l'espace entre les prénoms et « n'ont » (vu le 07/11/2026). */}
      <p>{`${prenomsDe(m)} n'ont pas encore l'appli de leur mariage. Offrez-la-leur : elle est gratuite pour eux.`}</p>
      <p className="ap-sous">Quand ils vous ajoutent dans leurs prestataires, leurs invités voient votre stand, et leur programme arrive ici tout seul.</p>
      {vu ? (
        <>
          <p className="ap-label">Le message, prêt à envoyer</p>
          <p className="pro-message">{texte}</p>
          <button type="button" className="ap-btn ap-btn-clair" onClick={copier}>
            <i className="ti ti-copy" aria-hidden="true" /> Copier le message
          </button>
          <p className="ap-sous" role="status">
            {copie || "Dans la démo, rien ne part : le message reste ici."}
          </p>
        </>
      ) : (
        <button type="button" className="ap-btn" onClick={() => setVu(true)}>
          <i className="ti ti-gift" aria-hidden="true" /> Offrir l&apos;appli à {prenomsDe(m)}
        </button>
      )}
    </section>
  );
}

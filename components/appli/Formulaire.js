"use client";

// Le formulaire des mariés : tout ce que verront les invités, rangé dans l'ordre de l'appli.
import { PRESTATAIRES, CATEGORIES, catByKey } from "../../lib/data";
import { LIMITES, EXEMPLES_INFOS } from "../../lib/appli/contenu";
import { useEffect, useState } from "react";
import { lireSelection, ecouter } from "../../lib/selection";

const SUGGESTIONS_INFOS = ["Tenue", "Parking", "Accès", "Navette", "Hébergement", "Enfants", "Fin de soirée", "Réseau sur place", "S'il pleut", "Venir de métropole", "Cadeaux"];

// Seuls les vrais stands se choisissent ici : les fiches d'exemple ne sont pas des prestataires réels.
const STANDS = PRESTATAIRES.filter((p) => !p.exemple);

export default function Formulaire({ valeur, onChange }) {
  const m = valeur;
  // Les vrais stands mis de côté dans « Ma sélection », pas encore dans l'appli.
  const [selection, setSelection] = useState([]);
  useEffect(() => {
    const f = () => setSelection(lireSelection().map((x) => x.slug));
    f();
    return ecouter(f);
  }, []);
  const aReprendre = selection.filter((s) => STANDS.some((x) => x.slug === s) && !m.prestataires.some((p) => p.slug === s));
  const maj = (fn) => {
    const copie = structuredClone(m);
    fn(copie);
    onChange(copie);
  };

  return (
    <div className="ed-form">
      <Bloc titre="Vous deux" sous="Ce qui s'affiche en grand, comme sur le faire-part.">
        <div className="ed-ligne2">
          <Champ label="Premier prénom" valeur={m.prenoms[0]} max={LIMITES.prenom} requis onChange={(v) => maj((c) => (c.prenoms[0] = v))} />
          <Champ label="Second prénom" valeur={m.prenoms[1]} max={LIMITES.prenom} requis onChange={(v) => maj((c) => (c.prenoms[1] = v))} />
        </div>
        <Champ label="Date du mariage" type="date" valeur={m.date} requis onChange={(v) => maj((c) => (c.date = v))} />
      </Bloc>

      <Bloc titre="Le lieu" sous="Le bouton « Itinéraire » des invités part de ces informations.">
        <Champ label="Nom du lieu" valeur={m.lieu.nom} max={LIMITES.court} requis onChange={(v) => maj((c) => (c.lieu.nom = v))} />
        <div className="ed-ligne2">
          <Champ label="Adresse (facultatif)" valeur={m.lieu.adresse} max={160} onChange={(v) => maj((c) => (c.lieu.adresse = v))} />
          <Champ label="Commune" valeur={m.lieu.ville} max={LIMITES.court} onChange={(v) => maj((c) => (c.lieu.ville = v))} />
        </div>
      </Bloc>

      <Bloc titre="Les infos pratiques" sous="Les questions que vos invités poseront. Une case laissée vide n'apparaît pas chez eux. Pas de code secret : le code du faire-part protège sans être un coffre-fort.">
        {m.infos.map((i, k) => (
          <div className="ed-rang ed-rang-info" key={k}>
            <Champ label="Quoi" valeur={i.titre} max={40} onChange={(v) => maj((c) => (c.infos[k].titre = v))} />
            <Champ label="L'information" valeur={i.texte} max={120} placeholder={EXEMPLES_INFOS[i.titre] ? `Ex. : ${EXEMPLES_INFOS[i.titre]}` : ""} onChange={(v) => maj((c) => (c.infos[k].texte = v))} />
            <Retirer onClick={() => maj((c) => c.infos.splice(k, 1))} quoi={i.titre || "cette ligne"} />
          </div>
        ))}
        {m.infos.length < LIMITES.infos && (
          <div className="ed-puces">
            {SUGGESTIONS_INFOS.filter((s) => !m.infos.some((i) => i.titre === s)).map((s) => (
              <button key={s} type="button" className="ed-puce" onClick={() => maj((c) => c.infos.push({ titre: s, texte: "" }))}>
                + {s}
              </button>
            ))}
            <button type="button" className="ed-puce" onClick={() => maj((c) => c.infos.push({ titre: "", texte: "" }))}>
              + Autre
            </button>
          </div>
        )}
      </Bloc>

      <Bloc titre="Le programme" sous="Heure par heure. Le jour J, l'appli montre aux invités le moment en cours. Les heures d'après minuit vont à la fin.">
        {m.programme.map((p, k) => (
          <div className="ed-rang ed-rang-prog" key={k}>
            <Champ label="Heure" type="time" valeur={p.heure} onChange={(v) => maj((c) => (c.programme[k].heure = v))} />
            <Champ label="Moment" valeur={p.titre} max={LIMITES.court} onChange={(v) => maj((c) => (c.programme[k].titre = v))} />
            <Champ label="Détail (facultatif)" valeur={p.detail} max={160} placeholder={/c[ée]r[ée]monie/i.test(p.titre) ? "Ex. : téléphones rangés, notre photographe s'en occupe" : ""} onChange={(v) => maj((c) => (c.programme[k].detail = v))} />
            <Retirer onClick={() => maj((c) => c.programme.splice(k, 1))} quoi={p.titre || "ce moment"} />
          </div>
        ))}
        {m.programme.length < LIMITES.programme && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => maj((c) => c.programme.push({ heure: "", titre: "", detail: "" }))}>
            <i className="ti ti-plus" aria-hidden="true" /> Ajouter un moment
          </button>
        )}
      </Bloc>

      <Bloc replie={!m.reponse.lien && !m.reponse.avant_le} titre="La réponse des invités" sous="Gardez votre formulaire habituel (Google Forms, Typeform…) : l'appli y mène en un appui. Pixie Mariage ne gère pas la liste des invités.">
        <div className="ed-ligne2">
          <Champ label="Lien de votre formulaire de réponse" type="url" valeur={m.reponse.lien} placeholder="https://…" onChange={(v) => maj((c) => (c.reponse.lien = v))} />
          <Champ label="Réponse attendue avant le" type="date" valeur={m.reponse.avant_le} onChange={(v) => maj((c) => (c.reponse.avant_le = v))} />
        </div>
      </Bloc>

      <Bloc replie={!m.conseil} titre="Un conseil pour vos invités" sous="Le meilleur moment pour la photo de groupe, la crème solaire, la route du retour…">
        <Zone valeur={m.conseil} max={LIMITES.texte} onChange={(v) => maj((c) => (c.conseil = v))} label="Votre conseil (facultatif)" />
      </Bloc>

      <Bloc replie={!m.photos_soir} titre="Le jour J : l'album partagé" sous="Un album partagé que vous ouvrez vous-mêmes (Google Photos, iCloud…). Les photos restent chez ce service, pas chez Pixie Mariage.">
        <Champ label="Lien de l'album partagé (facultatif)" type="url" valeur={m.photos_soir} placeholder="https://…" onChange={(v) => maj((c) => (c.photos_soir = v))} />
      </Bloc>

      <Bloc replie={!Object.values(m.apres).some(Boolean)} titre="Après le mariage" sous="À remplir plus tard : le mot de remerciement, et les liens que vous donnent votre vidéaste et votre photographe.">
        <Zone label="Votre mot de remerciement" valeur={m.apres.merci} max={LIMITES.texte} onChange={(v) => maj((c) => (c.apres.merci = v))} />
        <div className="ed-ligne2">
          <Champ label="Lien du teaser" type="url" valeur={m.apres.teaser} placeholder="https://…" onChange={(v) => maj((c) => (c.apres.teaser = v))} />
          <Champ label="Lien du film complet" type="url" valeur={m.apres.film} placeholder="https://…" onChange={(v) => maj((c) => (c.apres.film = v))} />
        </div>
        <div className="ed-ligne2">
          <Champ label="Lien de la galerie photo" type="url" valeur={m.apres.galerie} placeholder="https://…" onChange={(v) => maj((c) => (c.apres.galerie = v))} />
          <Champ label="Lien pour commander des tirages" type="url" valeur={m.apres.tirages} placeholder="https://…" onChange={(v) => maj((c) => (c.apres.tirages = v))} />
        </div>
      </Bloc>

      <Bloc replie={!m.prestataires.length} titre="Vos prestataires" sous="Ceux qui font votre mariage. Vos invités les retrouvent après la fête : c'est votre façon de les remercier.">
        {m.prestataires.map((p, k) => (
          <div className="ed-rang" key={k}>
            {p.slug !== undefined ? (
              <label className="ed-champ">
                <span>Stand du salon</span>
                <select value={p.slug} onChange={(e) => maj((c) => (c.prestataires[k].slug = e.target.value))}>
                  {!STANDS.some((s) => s.slug === p.slug) && (
                    <option value={p.slug} disabled>
                      Stand qui n&apos;est plus au salon
                    </option>
                  )}
                  {CATEGORIES.map((cat) => {
                    const liste = STANDS.filter((s) => s.categorie === cat.key);
                    if (!liste.length) return null;
                    return (
                      <optgroup key={cat.key} label={cat.nom}>
                        {liste.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.nom} · {s.ville}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </label>
            ) : (
              <>
                <Champ label="Nom" valeur={p.nom} max={LIMITES.court} onChange={(v) => maj((c) => (c.prestataires[k].nom = v))} />
                <Champ label="Son site (facultatif)" type="url" valeur={p.lien} placeholder="https://…" onChange={(v) => maj((c) => (c.prestataires[k].lien = v))} />
              </>
            )}
            <Champ label="Son rôle" valeur={p.role} max={40} placeholder="Les fleurs" onChange={(v) => maj((c) => (c.prestataires[k].role = v))} />
            <Retirer onClick={() => maj((c) => c.prestataires.splice(k, 1))} quoi={p.nom || "ce prestataire"} />
          </div>
        ))}
        {aReprendre.length > 0 && m.prestataires.length < LIMITES.prestataires && (
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={() =>
              maj((c) => {
                aReprendre.slice(0, LIMITES.prestataires - c.prestataires.length).forEach((slug) => {
                  const f = STANDS.find((x) => x.slug === slug);
                  c.prestataires.push({ slug, role: catByKey(f.categorie)?.nom || "" });
                });
              })
            }
          >
            <i className="ti ti-heart" aria-hidden="true" /> Reprendre ma sélection du salon ({Math.min(aReprendre.length, LIMITES.prestataires - m.prestataires.length)})
          </button>
        )}
        {m.prestataires.length < LIMITES.prestataires && (
          <div className="ed-puces">
            {STANDS.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => maj((c) => c.prestataires.push({ slug: STANDS[0].slug, role: catByKey(STANDS[0].categorie)?.nom || "" }))}
              >
                <i className="ti ti-building-store" aria-hidden="true" /> Un stand du salon
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => maj((c) => c.prestataires.push({ nom: "", role: "", lien: "" }))}>
              <i className="ti ti-plus" aria-hidden="true" /> {STANDS.length > 0 ? "Un autre prestataire" : "Ajouter un prestataire"}
            </button>
          </div>
        )}
        {STANDS.length === 0 && <p className="ed-aide">Les stands du salon s&apos;ajouteront ici en un clic, dès les premiers exposants.</p>}
      </Bloc>
    </div>
  );
}

// replie : une partie facultative, encore vide, se montre fermée (le formulaire reste court sur un téléphone).
function Bloc({ titre, sous, children, replie }) {
  // L'état ouvert/fermé n'est décidé qu'à l'ouverture de la page : il ne bouge plus pendant la saisie.
  const [ouvert, setOuvert] = useState(!replie);
  if (replie !== undefined)
    return (
      <details className="ed-bloc ed-replie" open={ouvert} onToggle={(e) => setOuvert(e.currentTarget.open)}>
        <summary>
          <span>{titre}</span>
          <small>Facultatif, à compléter quand vous voulez</small>
        </summary>
        {sous && <p className="ed-aide">{sous}</p>}
        {children}
      </details>
    );
  return (
    <fieldset className="ed-bloc">
      <legend>{titre}</legend>
      {sous && <p className="ed-aide">{sous}</p>}
      {children}
    </fieldset>
  );
}

function Champ({ label, valeur, onChange, type = "text", max, requis, placeholder }) {
  return (
    <label className="ed-champ">
      <span>
        {label}
        {requis && <em aria-hidden="true"> *</em>}
      </span>
      <input
        type={type}
        value={valeur || ""}
        maxLength={max}
        required={requis}
        placeholder={placeholder}
        inputMode={type === "url" ? "url" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Zone({ label, valeur, onChange, max }) {
  return (
    <label className="ed-champ">
      <span>{label}</span>
      <textarea rows={3} value={valeur || ""} maxLength={max} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Retirer({ onClick, quoi }) {
  return (
    <button type="button" className="ed-retirer" onClick={onClick} aria-label={`Retirer ${quoi}`} title="Retirer">
      <i className="ti ti-x" aria-hidden="true" />
    </button>
  );
}

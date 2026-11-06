// Où vivent les mariages et les chiffres des exposants.
// Deux modes, même interface :
//  - « en ligne » : la base Supabase de Pixie Mariage (fonctions SQL, jamais d'accès direct aux tables) ;
//  - « essai » : le navigateur de cet appareil seulement (tant que la base n'est pas branchée).
// Le mode se choisit à la construction du site, avec les deux variables ci-dessous.

import { nettoyer } from "./contenu";
import { MARIAGE_DEMO } from "./demo";

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const CLE_PUBLIQUE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const MODE = URL_BASE && CLE_PUBLIQUE ? "en-ligne" : "essai";

export class ErreurAppli extends Error {}

// ---------- Mode en ligne ----------
async function rpc(fonction, params) {
  let r;
  try {
    r = await fetch(`${URL_BASE}/rest/v1/rpc/${fonction}`, {
      method: "POST",
      headers: {
        apikey: CLE_PUBLIQUE,
        Authorization: `Bearer ${CLE_PUBLIQUE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
  } catch {
    throw new ErreurAppli("Pas de connexion. Réessayez dans un instant.");
  }
  if (!r.ok) {
    let msg = "";
    try {
      msg = (await r.json()).message || "";
    } catch {}
    throw new ErreurAppli(msg.startsWith("PM:") ? msg.slice(3).trim() : "Le serveur n'a pas répondu. Réessayez dans un instant.");
  }
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

// ---------- Mode essai (cet appareil) ----------
const ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
const ALPHA_CODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function hasard(n, alpha = ALPHA) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => alpha[x % alpha.length]).join("");
}
const lireTout = () => {
  try {
    return JSON.parse(localStorage.getItem("pm:mariages") || "{}");
  } catch {
    return {};
  }
};
const ecrireTout = (o) => {
  try {
    localStorage.setItem("pm:mariages", JSON.stringify(o));
  } catch {
    throw new ErreurAppli("Ce navigateur refuse d'enregistrer (navigation privée ?).");
  }
};
const lent = () => new Promise((r) => setTimeout(r, 150));

export function slugDepuis(prenoms) {
  const s = prenoms
    .join("-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${s || "mariage"}-${hasard(6)}`;
}

// ---------- L'interface commune ----------

// Crée le mariage. Rend { slug, code, cle } : le code va aux invités, la clé reste aux mariés.
export async function creerMariage(contenu) {
  const c = nettoyer(contenu);
  if (MODE === "en-ligne") return rpc("mariage_creer", { p_contenu: c });
  await lent();
  const tout = lireTout();
  const slug = slugDepuis(c.prenoms);
  const res = { slug, code: hasard(6, ALPHA_CODE), cle: hasard(24) };
  tout[slug] = { ...res, contenu: c, annonce: "", annonce_le: null };
  ecrireTout(tout);
  return res;
}

// Pour les invités : rend { contenu, annonce, annonce_le } ou null si le code ne va pas.
export async function lireMariage(slug, code) {
  if (slug === "demo") return { contenu: nettoyer(MARIAGE_DEMO.contenu), annonce: MARIAGE_DEMO.annonce, annonce_le: null, demo: true };
  if (MODE === "en-ligne") {
    const r = await rpc("mariage_lire", { p_slug: slug, p_code: (code || "").toUpperCase() });
    return r ? { ...r, contenu: nettoyer(r.contenu) } : null;
  }
  await lent();
  const m = lireTout()[slug];
  if (!m || m.code !== (code || "").toUpperCase()) return null;
  return { contenu: nettoyer(m.contenu), annonce: m.annonce, annonce_le: m.annonce_le };
}

// Pour les mariés, avec leur clé : rend { contenu, code, annonce } ou null.
export async function ouvrirMariage(slug, cle) {
  if (MODE === "en-ligne") {
    const r = await rpc("mariage_ouvrir", { p_slug: slug, p_cle: cle });
    return r ? { ...r, contenu: nettoyer(r.contenu) } : null;
  }
  await lent();
  const m = lireTout()[slug];
  if (!m || m.cle !== cle) return null;
  return { contenu: nettoyer(m.contenu), code: m.code, annonce: m.annonce };
}

export async function modifierMariage(slug, cle, contenu) {
  const c = nettoyer(contenu);
  if (MODE === "en-ligne") return rpc("mariage_modifier", { p_slug: slug, p_cle: cle, p_contenu: c });
  await lent();
  const tout = lireTout();
  if (!tout[slug] || tout[slug].cle !== cle) throw new ErreurAppli("Lien de modification inconnu.");
  tout[slug].contenu = c;
  ecrireTout(tout);
  return true;
}

export async function annoncer(slug, cle, texte) {
  const t = (texte || "").trim().slice(0, 280);
  if (MODE === "en-ligne") return rpc("mariage_annoncer", { p_slug: slug, p_cle: cle, p_texte: t });
  await lent();
  const tout = lireTout();
  if (!tout[slug] || tout[slug].cle !== cle) throw new ErreurAppli("Lien de modification inconnu.");
  tout[slug].annonce = t;
  tout[slug].annonce_le = t ? new Date().toISOString() : null;
  ecrireTout(tout);
  return true;
}

export async function supprimerMariage(slug, cle) {
  if (MODE === "en-ligne") return rpc("mariage_supprimer", { p_slug: slug, p_cle: cle });
  await lent();
  const tout = lireTout();
  if (!tout[slug] || tout[slug].cle !== cle) throw new ErreurAppli("Lien de modification inconnu.");
  delete tout[slug];
  ecrireTout(tout);
  return true;
}

// ---------- Les chiffres des exposants (aucune donnée personnelle : des totaux par jour) ----------
// type : "vue" (fiche ouverte), "contact" (clic sur le contact), "depuis_mariage" (venu d'une appli de mariage)
export function compter(slug, type) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug || "")) return;
  if (MODE === "en-ligne") {
    rpc("compter", { p_slug: slug, p_type: type }).catch(() => {});
    return;
  }
  try {
    const k = "pm:compteurs";
    const o = JSON.parse(localStorage.getItem(k) || "{}");
    const jour = new Date().toISOString().slice(0, 10);
    const id = `${slug}|${type}|${jour}`;
    o[id] = (o[id] || 0) + 1;
    localStorage.setItem(k, JSON.stringify(o));
  } catch {}
}

// Rend { nom?, depuis, totaux: {vue, contact, depuis_mariage}, mois: {...}, mariages, jours: [{jour, vue, contact, depuis_mariage}] } ou null.
export async function chiffresExposant(slug, cle) {
  if (MODE === "en-ligne") return rpc("exposant_chiffres", { p_slug: slug, p_cle: cle });
  await lent();
  if (cle !== "essai") return null;
  let o = {};
  try {
    o = JSON.parse(localStorage.getItem("pm:compteurs") || "{}");
  } catch {}
  const parJour = {};
  const totaux = { vue: 0, contact: 0, depuis_mariage: 0 };
  Object.entries(o).forEach(([id, n]) => {
    const [s, type, jour] = id.split("|");
    if (s !== slug || !(type in totaux)) return;
    totaux[type] += n;
    parJour[jour] = parJour[jour] || { jour, vue: 0, contact: 0, depuis_mariage: 0 };
    parJour[jour][type] += n;
  });
  const mariages = Object.values(lireTout()).filter((m) => (m.contenu?.prestataires || []).some((p) => p.slug === slug)).length;
  return { depuis: null, totaux, mois: totaux, mariages, jours: Object.values(parJour).sort((a, b) => a.jour.localeCompare(b.jour)) };
}

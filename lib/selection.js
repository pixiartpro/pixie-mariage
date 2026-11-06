// « Ma sélection » : les stands mis de côté par un couple, gardés sur son appareil (rien sur un serveur).
// Partage à deux : la liste voyage dans le lien (/ma-selection/?s=stand1,stand2), jamais ailleurs.
import { PRESTATAIRES } from "./data";

const CLE = "pm:selection";
const EVENEMENT = "pm:selection";
const connu = (s) => PRESTATAIRES.some((p) => p.slug === s);

export function lireSelection() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || "[]");
    return Array.isArray(v) ? v.filter((x) => x && connu(x.slug)) : [];
  } catch {
    return [];
  }
}

function ecrire(liste) {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {}
  window.dispatchEvent(new Event(EVENEMENT));
}

export function estChoisi(slug) {
  return lireSelection().some((x) => x.slug === slug);
}

export function basculer(slug) {
  const l = lireSelection();
  ecrire(l.some((x) => x.slug === slug) ? l.filter((x) => x.slug !== slug) : [...l, { slug, note: "" }]);
}

export function noter(slug, note) {
  ecrire(lireSelection().map((x) => (x.slug === slug ? { ...x, note: String(note).slice(0, 200) } : x)));
}

export function ajouterPlusieurs(slugs) {
  const l = lireSelection();
  const nouveaux = slugs.filter((s) => connu(s) && !l.some((x) => x.slug === s)).map((slug) => ({ slug, note: "" }));
  ecrire([...l, ...nouveaux]);
  return nouveaux.length;
}

export function ecouter(fn) {
  const f = () => fn();
  window.addEventListener(EVENEMENT, f);
  window.addEventListener("storage", f);
  return () => {
    window.removeEventListener(EVENEMENT, f);
    window.removeEventListener("storage", f);
  };
}

// Lit une liste partagée dans l'adresse : seulement des stands qui existent, 30 au plus.
export function slugsDuLien(texte) {
  return [...new Set(String(texte || "").split(",").map((s) => s.trim()).filter(connu))].slice(0, 30);
}

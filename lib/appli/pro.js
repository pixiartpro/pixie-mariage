// L'espace pro : l'agenda, les demandes des couples et les mariages d'un prestataire.
// Rien ici ne touche au réseau : c'est du calcul pur, testable (tests/pro.test.mjs).
// Aujourd'hui, seule la démonstration s'en sert (/espace-pro/). La vraie version lira la base.
//
// L'état d'un pro : { libres: ["AAAA-MM-JJ", …], demandes: [...], mariages: [...] }.
//  - libres : les jours que le pro a cochés « libre ». Un jour réservé reste dans la liste
//    mais compte comme réservé : si la réservation tombe, le jour redevient libre tout seul.
//  - une demande : { id, prenoms, date, ville, invites, message, recue, etape }.
//  - un mariage : { id, prenoms, date, lieu: { nom, ville }, role, appli, demande? }.
//    appli : le slug de l'appli du mariage quand les mariés en ont une (« demo » pour la démonstration).

const MS_JOUR = 86400000;
const midi = (iso) => Date.parse(iso + "T12:00:00Z");
export const isoDe = (ms) => new Date(ms).toISOString().slice(0, 10);
export const decaler = (iso, jours) => isoDe(midi(iso) + jours * MS_JOUR);
export const estSamedi = (iso) => new Date(midi(iso)).getUTCDay() === 6;
export const prenomsDe = (x) => (x?.prenoms || []).filter(Boolean).join(" & ");
// « le mariage d'Anaïs & Kévin », « le mariage de Léa & Mathis ».
export const deCouple = (x) => {
  const p = prenomsDe(x);
  return /^[aeiouyhàâäéèêëîïôöûüœ]/i.test(p) ? `d'${p}` : `de ${p}`;
};

// Les semaines d'un mois, du lundi au dimanche. Une case hors du mois vaut null. mois : de 1 à 12.
export function grilleMois(annee, mois) {
  const premier = Date.UTC(annee, mois - 1, 1, 12);
  const nbJours = new Date(Date.UTC(annee, mois, 0, 12)).getUTCDate();
  const avant = (new Date(premier).getUTCDay() + 6) % 7;
  const cases = [...Array(avant).fill(null), ...Array.from({ length: nbJours }, (_, i) => isoDe(premier + i * MS_JOUR))];
  while (cases.length % 7) cases.push(null);
  const semaines = [];
  for (let i = 0; i < cases.length; i += 7) semaines.push(cases.slice(i, i + 7));
  return semaines;
}

export const moisSuivant = ({ annee, mois }, n = 1) => {
  const t = annee * 12 + (mois - 1) + n;
  return { annee: Math.floor(t / 12), mois: (t % 12) + 1 };
};

const EN_COURS = ["nouvelle", "repondu", "devis"];
export const demandeEnCours = (d) => EN_COURS.includes(d.etape);

// L'état d'un jour dans l'agenda : passe, reserve, libre ou rien.
export function etatJour(iso, etat, aujourdhui) {
  if (iso < aujourdhui) return "passe";
  if (etat.mariages.some((m) => m.date === iso)) return "reserve";
  if (etat.libres.includes(iso)) return "libre";
  return "rien";
}

// Ce que le pro sait de la date d'une demande : pris (un mariage ce jour-là), libre (jour coché), ou inconnu.
export function dispo(iso, etat) {
  const mariage = etat.mariages.find((m) => m.date === iso);
  if (mariage) return { etat: "pris", mariage };
  if (etat.libres.includes(iso)) return { etat: "libre" };
  return { etat: "inconnu" };
}

// Coche ou décoche un jour libre. Un jour passé ou réservé ne bouge pas.
export function basculerLibre(etat, iso, aujourdhui) {
  const e = etatJour(iso, etat, aujourdhui);
  if (e === "passe" || e === "reserve") return etat;
  const libres = e === "libre" ? etat.libres.filter((x) => x !== iso) : [...etat.libres, iso].sort();
  return { ...etat, libres };
}

// Les samedis d'un mois qu'on peut encore cocher (ni passés, ni réservés, ni déjà cochés).
export function samedisACocher(etat, annee, mois, aujourdhui) {
  return grilleMois(annee, mois)
    .flat()
    .filter((iso) => iso && estSamedi(iso) && etatJour(iso, etat, aujourdhui) === "rien");
}

export function cocherSamedis(etat, annee, mois, aujourdhui) {
  const ajout = samedisACocher(etat, annee, mois, aujourdhui);
  return ajout.length ? { ...etat, libres: [...etat.libres, ...ajout].sort() } : etat;
}

export const ETAPES = [
  { cle: "nouvelle", nom: "Nouvelle" },
  { cle: "repondu", nom: "Répondu" },
  { cle: "devis", nom: "Devis envoyé" },
  { cle: "reserve", nom: "Réservé" },
  { cle: "sans-suite", nom: "Sans suite" },
];

// Passe une demande à une autre étape. Rend { etat, erreur?, mariage? }.
// « Réservé » crée le mariage et prend la date, sauf si un autre mariage tient déjà ce jour-là.
// Quitter « Réservé » retire le mariage créé par cette demande.
export function changerEtape(etat, id, etape, role = "") {
  const d = etat.demandes.find((x) => x.id === id);
  if (!d || !ETAPES.some((x) => x.cle === etape)) return { etat, erreur: "Cette demande n'existe plus." };
  if (d.etape === etape) return { etat };
  const sansLui = etat.mariages.filter((m) => m.demande !== id);
  if (etape === "reserve") {
    const deja = sansLui.find((m) => m.date === d.date);
    if (deja) return { etat, erreur: `Ce jour-là, vous avez déjà le mariage ${deCouple(deja)}.` };
  }
  const demandes = etat.demandes.map((x) => (x.id === id ? { ...x, etape } : x));
  if (etape !== "reserve") return { etat: { ...etat, demandes, mariages: sansLui } };
  const mariage = { id: `m-${id}`, demande: id, prenoms: d.prenoms, date: d.date, lieu: { nom: "", ville: d.ville || "" }, role, appli: "" };
  return { etat: { ...etat, demandes, mariages: [...sansLui, mariage] }, mariage };
}

export const aVenir = (mariages, aujourdhui) => mariages.filter((m) => m.date >= aujourdhui).sort((a, b) => a.date.localeCompare(b.date));
export const passes = (mariages, aujourdhui) => mariages.filter((m) => m.date < aujourdhui).sort((a, b) => b.date.localeCompare(a.date));

// Le résumé du jour : demandes nouvelles, prochain mariage, jours libres à venir.
export function resume(etat, aujourdhui) {
  return {
    nouvelles: etat.demandes.filter((d) => d.etape === "nouvelle").length,
    prochain: aVenir(etat.mariages, aujourdhui)[0] || null,
    libres: etat.libres.filter((iso) => etatJour(iso, etat, aujourdhui) === "libre").length,
  };
}

export function ilYa(iso, aujourdhui) {
  const n = Math.round((midi(aujourdhui) - midi(iso)) / MS_JOUR);
  if (n <= 0) return "aujourd'hui";
  if (n === 1) return "hier";
  return `il y a ${n} jours`;
}

// Le message que le pro envoie à ses mariés pour leur offrir l'appli du mariage.
export function messageOffrirAppli(prenoms, nomPro, lien) {
  const a = (prenoms || []).filter(Boolean).join(" et ");
  return [
    `Bonjour ${a},`,
    "Je vous offre l'appli de votre mariage : le lieu, le programme et les infos pratiques au même endroit pour vos invités, et vos souvenirs après la fête. C'est gratuit et ça se prépare en quelques minutes :",
    lien,
    "Ajoutez-moi dans vos prestataires : je verrai votre programme à jour, sans message à faire suivre.",
    "À très vite,",
    nomPro,
  ].join("\n");
}

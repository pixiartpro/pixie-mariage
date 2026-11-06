// L'appli du mariage : la forme d'un mariage, et les calculs partagés
// entre l'éditeur des mariés et la page des invités.
// Rien ici ne touche au réseau : c'est du calcul pur, testable.

export const VERSION = 1;

export const LIMITES = {
  prenom: 40,
  court: 80,
  texte: 400,
  annonce: 280,
  programme: 20,
  infos: 12,
  prestataires: 20,
};

// Un mariage vide, prêt à remplir.
export function mariageVide() {
  return {
    v: VERSION,
    prenoms: ["", ""],
    date: "",
    lieu: { nom: "", ville: "", adresse: "" },
    // Les questions que les invités posent toujours. Une case laissée vide n'est pas montrée aux invités.
    infos: [
      { titre: "Tenue", texte: "" },
      { titre: "Parking", texte: "" },
      { titre: "Enfants", texte: "" },
      { titre: "Fin de soirée", texte: "" },
      { titre: "Réseau sur place", texte: "" },
      { titre: "S'il pleut", texte: "" },
      { titre: "Venir de métropole", texte: "" },
    ],
    programme: [
      { heure: "15:30", titre: "Accueil des invités", detail: "" },
      { heure: "16:00", titre: "Cérémonie", detail: "" },
      { heure: "17:00", titre: "Vin d'honneur", detail: "" },
      { heure: "19:30", titre: "Dîner", detail: "" },
    ],
    reponse: { lien: "", avant_le: "" },
    conseil: "",
    photos_soir: "",
    apres: { merci: "", teaser: "", film: "", galerie: "", tirages: "" },
    prestataires: [],
  };
}

const coupe = (s, n) => (typeof s === "string" ? s.trim().slice(0, n) : "");

// Seuls les liens https:// passent : jamais de javascript:, data: ou http: en clair.
export function lienSur(u) {
  if (typeof u !== "string") return "";
  const t = u.trim();
  if (!t) return "";
  try {
    const url = new URL(t);
    if (url.protocol !== "https:") return "";
    return url.href.slice(0, 500);
  } catch {
    return "";
  }
}

// Une vraie date du calendrier (le 30 février est refusé, pas décalé au 2 mars).
const dateSure = (d) => {
  if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  const t = Date.parse(d + "T12:00:00Z");
  return !isNaN(t) && new Date(t).toISOString().slice(0, 10) === d ? d : "";
};
const heureSure = (h) => (typeof h === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(h) ? h : "");
const slugSur = (s) => (typeof s === "string" && /^[a-z0-9-]{1,80}$/.test(s) ? s : "");

// Remet n'importe quel objet reçu dans la forme attendue (champs inconnus jetés,
// textes coupés, liens filtrés). Utilisé à l'enregistrement ET à l'affichage.
export function nettoyer(brut) {
  const m = brut && typeof brut === "object" ? brut : {};
  const L = LIMITES;
  const tab = (x) => (Array.isArray(x) ? x : []);
  const prenoms = tab(m.prenoms).slice(0, 2).map((p) => coupe(p, L.prenom));
  while (prenoms.length < 2) prenoms.push("");
  return {
    v: VERSION,
    prenoms,
    date: dateSure(m.date),
    lieu: {
      nom: coupe(m.lieu?.nom, L.court),
      ville: coupe(m.lieu?.ville, L.court),
      adresse: coupe(m.lieu?.adresse, 160),
    },
    infos: tab(m.infos)
      .filter((i) => i && (i.titre || i.texte))
      .slice(0, L.infos)
      .map((i) => ({ titre: coupe(i?.titre, 40), texte: coupe(i?.texte, 120) })),
    programme: tab(m.programme)
      .slice(0, L.programme)
      .map((p) => ({ heure: heureSure(p?.heure), titre: coupe(p?.titre, L.court), detail: coupe(p?.detail, 160) })),
    reponse: { lien: lienSur(m.reponse?.lien), avant_le: dateSure(m.reponse?.avant_le) },
    conseil: coupe(m.conseil, L.texte),
    photos_soir: lienSur(m.photos_soir),
    apres: {
      merci: coupe(m.apres?.merci, L.texte),
      teaser: lienSur(m.apres?.teaser),
      film: lienSur(m.apres?.film),
      galerie: lienSur(m.apres?.galerie),
      tirages: lienSur(m.apres?.tirages),
    },
    prestataires: tab(m.prestataires)
      .slice(0, L.prestataires)
      .map((p) =>
        slugSur(p?.slug)
          ? { slug: p.slug, role: coupe(p?.role, 40) }
          : { nom: coupe(p?.nom, L.court), role: coupe(p?.role, 40), lien: lienSur(p?.lien) }
      )
      .filter((p) => p.slug || p.nom),
  };
}

// Ce qui manque pour publier. Liste vide = prêt.
export function manques(m) {
  const r = [];
  if (!m.prenoms[0] || !m.prenoms[1]) r.push("les deux prénoms");
  if (!m.date) r.push("la date");
  if (!m.lieu.nom) r.push("le nom du lieu");
  return r;
}

// ---------- Le temps, à l'heure de La Réunion (UTC+4, sans heure d'été) ----------
const DECALAGE_MS = 4 * 3600 * 1000;

export function maintenantReunion(now = Date.now()) {
  const d = new Date(now + DECALAGE_MS);
  return { jour: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

const jourSuivant = (iso) => new Date(Date.parse(iso + "T12:00:00Z") + 86400000).toISOString().slice(0, 10);

// avant · jour · apres. La nuit du mariage compte encore comme « le jour J » jusqu'à 6 h.
export function phase(date, now = Date.now()) {
  if (!date) return "avant";
  const t = maintenantReunion(now);
  if (t.jour < date) return "avant";
  if (t.jour === date) return "jour";
  if (t.jour === jourSuivant(date) && t.minutes < 360) return "jour";
  return "apres";
}

export function joursRestants(date, now = Date.now()) {
  if (!date) return null;
  const t = maintenantReunion(now);
  return Math.round((Date.parse(date + "T12:00:00Z") - Date.parse(t.jour + "T12:00:00Z")) / 86400000);
}

const enMinutes = (h) => {
  if (!h) return null;
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};

// Le moment en cours du programme, le jour J (index, ou -1 avant le premier).
// Les heures avant 6 h sont comptées après minuit.
export function momentEnCours(programme, date, now = Date.now()) {
  if (phase(date, now) !== "jour") return null;
  const t = maintenantReunion(now);
  const nuit = t.jour !== date;
  const ici = t.minutes + (nuit ? 1440 : 0);
  let idx = -1;
  programme.forEach((p, i) => {
    let m = enMinutes(p.heure);
    if (m === null) return;
    if (m < 360) m += 1440;
    if (m <= ici) idx = i;
  });
  return idx;
}

export const heureLisible = (h) => (h ? h.replace(":", " h ") : "");

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export function dateLisible(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  const j = JOURS[d.getUTCDay()];
  return `${j.charAt(0).toUpperCase() + j.slice(1)} ${d.getUTCDate()} ${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function lienItineraire(lieu) {
  const q = [lieu.nom, lieu.adresse, lieu.ville, "La Réunion"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

// Fichier agenda (.ics) : la journée, de la première à la dernière heure du programme.
export function fichierAgenda(m, lienPage) {
  const heures = m.programme.map((p) => enMinutes(p.heure)).filter((x) => x !== null && x >= 360);
  const debutMin = heures.length ? Math.min(...heures) : 15 * 60;
  const finMin = debutMin + 10 * 60;
  const base = Date.parse(m.date + "T00:00:00Z") - DECALAGE_MS;
  const fmt = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const titre = `Mariage de ${m.prenoms[0]} & ${m.prenoms[1]}`;
  const lieu = [m.lieu.nom, m.lieu.adresse, m.lieu.ville].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PIX-I-ART//Pixie Mariage//FR",
    "BEGIN:VEVENT",
    `UID:${m.date}-${encodeURIComponent(m.prenoms.join("-"))}@pixie-mariage`,
    `DTSTAMP:${fmt(Date.now())}`,
    `DTSTART:${fmt(base + debutMin * 60000)}`,
    `DTEND:${fmt(base + finMin * 60000)}`,
    `SUMMARY:${esc(titre)}`,
    lieu ? `LOCATION:${esc(lieu)}` : "",
    lienPage ? `DESCRIPTION:${esc("Le programme et les infos pratiques : " + lienPage)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

// Les liens remplis mais refusés (pas en https://) : on prévient au lieu de les jeter en silence.
export function liensRefuses(m) {
  const r = [];
  const test = (v, nom) => {
    if (typeof v === "string" && v.trim() && !lienSur(v)) r.push(nom);
  };
  test(m.reponse?.lien, "le formulaire de réponse");
  test(m.photos_soir, "l'album partagé");
  test(m.apres?.teaser, "le teaser");
  test(m.apres?.film, "le film");
  test(m.apres?.galerie, "la galerie");
  test(m.apres?.tirages, "les tirages");
  (m.prestataires || []).forEach((p) => test(p?.lien, `le site de ${p?.nom || "un prestataire"}`));
  return r;
}

// Un exemple par question pratique, pour guider les mariés sans rien remplir à leur place.
export const EXEMPLES_INFOS = {
  Tenue: "Chic, tons clairs",
  Parking: "Sur place, 80 places",
  Accès: "Portail ouvert dès 15 h",
  Enfants: "Bienvenus, coin jeux prévu",
  "Fin de soirée": "Vers 2 h",
  "Réseau sur place": "Faible : notez l'itinéraire avant de partir",
  "S'il pleut": "Cérémonie sous le chapiteau, même heure",
  "Venir de métropole": "Aéroport Roland-Garros, puis 1 h de route",
  Navette: "Retour à 1 h et 2 h",
  Hébergement: "Gîtes à 5 minutes, liste sur demande",
  Cadeaux: "Votre présence suffit",
};

// Le message que les mariés envoient à leurs invités (WhatsApp, SMS, mail). Le lien contient déjà le code.
export function messageInvites(prenoms, date, lien) {
  const qui = [prenoms[0], prenoms[1]].filter(Boolean).join(" & ");
  const quand = date ? ` le ${dateLisible(date).toLowerCase()}` : "";
  return `${qui} se marient${quand} ! Le lieu, le programme et, après la fête, le film et les photos : tout est ici, sans appli à installer.\n${lien}`;
}

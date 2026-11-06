// La grille publique des exposants (décidée par Guillaume le jeudi 05/11/2026), en un seul endroit,
// pour le calcul de la candidature. Montants HT ; TVA de La Réunion 8,5 %.
export const TVA = 0.085;
export const TARIFS = {
  film: 500, // le film du stand filmé (sortie groupée)
  filmSurMesure: 600, // le film tourné seul, à la date de l'exposant
  presence: 200, // présence annuelle
  presenceFondateur: 150, // présence des 10 premiers exposants, 3 premières années
  partenaireMois: 690,
};
// Places fondateur encore libres : à baisser à la main à chaque signature.
export const PLACES_FONDATEUR = 10;

export const FORMULES = [
  { key: "stand", nom: "Le stand filmé", film: TARIFS.film, aide: "Tournage en sortie groupée avec d'autres exposants de votre coin de l'île." },
  { key: "mesure", nom: "La vidéo sur mesure", film: TARIFS.filmSurMesure, aide: "Tourné chez vous seul, à la date qui vous arrange." },
  { key: "videaste", nom: "Vidéaste : mon stand montre mes films", film: 0, aide: "Pas de tournage : votre stand présente vos propres films." },
];

const arrondi = (n) => Math.round(n * 100) / 100;
export const ttc = (ht) => arrondi(ht * (1 + TVA));
export const euros = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

// Ce que paie l'exposant : la première année, puis chaque année suivante.
export function devis({ formule, fondateur, partenaire }) {
  const f = FORMULES.find((x) => x.key === formule) || FORMULES[0];
  const presence = fondateur ? TARIFS.presenceFondateur : TARIFS.presence;
  const premiere = f.film + presence + (partenaire ? TARIFS.partenaireMois : 0);
  return {
    formule: f,
    film: f.film,
    presence,
    partenaire: partenaire ? TARIFS.partenaireMois : 0,
    premiere,
    // Années 2 et 3 au tarif fondateur, puis grille publique.
    ensuite: presence,
    apresFondateur: TARIFS.presence,
  };
}

// SIRET : 14 chiffres, clé de Luhn (exception connue : La Poste, SIREN 356000000).
export function siretValide(s) {
  const d = String(s || "").replace(/\s/g, "");
  if (!/^\d{14}$/.test(d)) return false;
  if (d.startsWith("356000000")) return d.split("").reduce((a, c) => a + Number(c), 0) % 5 === 0;
  let somme = 0;
  for (let i = 0; i < 14; i++) {
    let n = Number(d[13 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    somme += n;
  }
  return somme % 10 === 0;
}

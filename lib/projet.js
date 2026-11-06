// Le projet du couple (date, commune, nombre d'invités), gardé sur son appareil pour préremplir ses demandes de devis.
const CLE = "pm:projet";

export function lireProjet() {
  try {
    const p = JSON.parse(localStorage.getItem(CLE) || "{}");
    return {
      date: typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : "",
      commune: typeof p.commune === "string" ? p.commune.slice(0, 60) : "",
      invites: typeof p.invites === "string" ? p.invites.replace(/\D/g, "").slice(0, 4) : "",
    };
  } catch {
    return { date: "", commune: "", invites: "" };
  }
}

export function ecrireProjet(p) {
  try {
    localStorage.setItem(CLE, JSON.stringify(p));
  } catch {}
}

const dateFr = (iso) => {
  if (!iso) return "";
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
};

// Le mail de demande de mise en relation, vers le salon (qui transmet au prestataire sans tri).
export function mailDevis(email, nomPresta, metier, ville, projet) {
  const lignes = [
    "Bonjour,",
    "",
    `J'aimerais être mis·e en relation avec ${nomPresta} (${metier}, ${ville}), vu sur Pixie Mariage.`,
    "",
    projet.date ? `Date du mariage : ${dateFr(projet.date)}` : "Date du mariage : pas encore fixée",
    projet.commune ? `Commune : ${projet.commune}` : "",
    projet.invites ? `Nombre d'invités : environ ${projet.invites}` : "",
    "",
    "Merci !",
  ].filter((l, i, t) => l !== "" || (t[i - 1] !== "" && i > 0));
  return `mailto:${email}?subject=${encodeURIComponent("Demande de contact — " + nomPresta)}&body=${encodeURIComponent(lignes.join("\n"))}`;
}

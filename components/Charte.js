// « Ce qu'on ne vous fera jamais » : les engagements du salon envers les exposants.
// Chaque ligne correspond au contrat de stand (articles 5, 6 et 7) et aux règles du salon.
import Link from "next/link";

export const ENGAGEMENTS = [
  ["Vendre une place dans le classement", "L'ordre des stands ne s'achète pas, ni pour vous ni pour un autre."],
  ["Prendre une commission sur vos contrats", "Ce que vous signez avec un couple reste entre vous et lui."],
  ["Revendre ou trier vos contacts", "Les demandes des couples vous sont transmises sans délai, sans tri."],
  ["Vous reconduire en silence", "Une proposition écrite 30 jours avant l'échéance. Sans paiement, votre stand est mis en pause, jamais effacé."],
  ["Vous garder captif de votre film", "Une fois réglé, vous l'utilisez partout pour votre promotion, y compris sur les autres annuaires."],
  ["Vous promettre des chiffres", "Aucune audience garantie : vous voyez les chiffres bruts de votre stand dans votre espace."],
];

export default function Charte({ titre = "Ce qu'on ne vous fera jamais", lien = true }) {
  return (
    <section className="charte" aria-labelledby="charte-titre">
      <h2 id="charte-titre">{titre}</h2>
      <ul>
        {ENGAGEMENTS.map(([quoi, detail]) => (
          <li key={quoi}>
            <i className="ti ti-ban" aria-hidden="true" />
            <div>
              <b>{quoi}</b>
              <span>{detail}</span>
            </div>
          </li>
        ))}
      </ul>
      {lien && (
        <p className="charte-pied">
          Écrit dans le contrat de stand et dans <Link href="/regles-du-salon">les règles du salon</Link>.
        </p>
      )}
    </section>
  );
}

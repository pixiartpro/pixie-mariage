import Link from "next/link";
import { SALON } from "../../../../lib/data";

export const metadata = {
  title: "L'appli du mariage : vos données — Pixie Mariage",
  description: "Ce que l'appli du mariage garde, où, combien de temps, et comment tout effacer.",
};

export default function Confidentialite() {
  return (
    <section className="section tight">
      <div className="container regles appli-texte">
        <p className="eyebrow">L&apos;appli du mariage</p>
        <h1 className="section-title">Vos données, en clair</h1>

        <h2>Qui s&apos;en occupe</h2>
        <p>
          PIX-I-ART, studio de La Réunion, fait fonctionner Pixie Mariage et son appli du mariage. Pour toute question sur vos données : <a href={`mailto:${SALON.email}`}>{SALON.email}</a>.
        </p>

        <h2>Ce que l&apos;appli garde</h2>
        <p>
          Seulement ce que les mariés écrivent eux-mêmes : leurs prénoms, la date, le lieu, les infos pratiques, le programme, les liens qu&apos;ils ajoutent et leur mot aux invités. Rien d&apos;autre. L&apos;appli ne gère ni liste d&apos;invités, ni réponses, ni photos, ni paiement.
        </p>
        <p>
          Elle sert à une seule chose : montrer ces informations aux invités qui ont le code du faire-part. C&apos;est le service que les mariés demandent en créant l&apos;appli. Rien n&apos;est vendu, rien ne sert à de la publicité.
        </p>

        <h2>Pour les invités</h2>
        <p>
          L&apos;appli ne vous demande rien : ni nom, ni adresse mail, ni compte. Votre téléphone retient seulement le code du faire-part et le dernier mariage ouvert, pour ne pas vous le redemander. Ces deux informations restent sur votre téléphone. Aucun cookie de mesure, aucune publicité.
        </p>

        <h2>Les chiffres des stands</h2>
        <p>
          Quand une fiche de prestataire est ouverte, le salon ajoute 1 à un total du jour (fiche vue, contact cliqué, venue depuis une appli de mariage). Ces totaux ne contiennent ni adresse IP, ni identifiant, ni cookie : personne ne peut savoir qui a regardé quoi.
        </p>

        <h2>Où et combien de temps</h2>
        <p>
          Les informations des mariés sont enregistrées chez Supabase, sur des serveurs situés à Paris. Le site lui-même est servi par GitHub Pages, qui voit passer, comme tout hébergeur, l&apos;adresse technique des visiteurs dans ses journaux.
        </p>
        <p>
          <b>L&apos;appli et tout son contenu sont effacés 90 jours après la date du mariage.</b> Les mariés peuvent aussi tout effacer avant, d&apos;un bouton, depuis leur lien privé.
        </p>

        <h2>Le code du faire-part</h2>
        <p>
          Le code évite que l&apos;appli s&apos;ouvre pour n&apos;importe qui, mais ce n&apos;est pas un coffre-fort : il est imprimé sur des faire-part. N&apos;y écrivez rien que vous ne mettriez pas sur une invitation.
        </p>

        <h2>Vos droits</h2>
        <p>
          Les mariés corrigent tout eux-mêmes avec leur lien privé, et l&apos;effacent quand ils veulent. Pour tout autre demande (accès, rectification, effacement, opposition), écrivez à <a href={`mailto:${SALON.email}`}>{SALON.email}</a> : réponse sous un mois. Vous pouvez aussi saisir la CNIL (cnil.fr).
        </p>

        <p style={{ marginTop: 30 }}>
          <Link href="/appli-du-mariage/" className="btn btn-ghost">Retour à l&apos;appli du mariage</Link>
        </p>
      </div>
    </section>
  );
}

import Link from "next/link";
import { SALON } from "../../../../lib/data";

export const metadata = {
  title: "L'appli du mariage : vos données — Pixie Mariage",
  description: "Ce que l'appli du mariage garde, où, combien de temps, et comment tout effacer.",
};

export default function Confidentialite() {
  const mail = <a href={`mailto:${SALON.email}`}>{SALON.email}</a>;
  return (
    <section className="section tight">
      <div className="container appli-texte">
        <p className="eyebrow">L&apos;appli du mariage</p>
        <h1 className="section-title">Vos données, en clair</h1>

        <h2>Qui s&apos;en occupe</h2>
        <p>
          Le responsable est PIX-I-ART, SASU au capital de 1 000 €, 81 Chemin Finette, 97490 Sainte-Clotilde (La Réunion), RCS Saint-Denis 980 951 065. PIX-I-ART fait fonctionner Pixie Mariage et son appli du mariage. Pour toute question sur vos données : {mail}.
        </p>

        <h2>Ce que l&apos;appli garde, et pourquoi</h2>
        <p>
          Seulement ce que les mariés écrivent eux-mêmes : leurs prénoms, la date, le lieu, les infos pratiques, le programme, les liens qu&apos;ils ajoutent, les prestataires qu&apos;ils citent et leur mot aux invités. L&apos;appli ne gère ni liste d&apos;invités, ni réponses, ni photos, ni paiement.
        </p>
        <p>
          Elle sert à une seule chose : montrer ces informations aux invités qui ont le code du faire-part. C&apos;est le service que les mariés demandent en créant l&apos;appli (base légale : l&apos;exécution du service demandé, article 6.1.b du RGPD). Rien n&apos;est vendu, rien ne sert à de la publicité.
        </p>

        <h2>Pour les invités</h2>
        <p>
          L&apos;appli ne vous demande rien : ni nom, ni adresse mail, ni compte. Votre téléphone retient seulement le code du faire-part et le dernier mariage ouvert, pour ne pas vous les redemander. Ces deux informations restent sur votre téléphone. Aucun cookie de publicité ou de suivi.
        </p>

        <h2>Pour les mariés</h2>
        <p>
          Le navigateur qui a créé l&apos;appli garde votre brouillon et votre lien privé, pour vous éviter de les recopier. Sur un ordinateur ou un téléphone partagé, utilisez le bouton « Oublier le lien privé sur cet appareil », ou effacez les données du site.
        </p>

        <h2>Les chiffres des stands</h2>
        <p>
          Quand la fiche d&apos;un prestataire exposant est ouverte, le salon ajoute 1 à un total du jour : fiche vue, contact cliqué, venue depuis l&apos;appli d&apos;un mariage. Ces totaux ne contiennent ni adresse IP, ni identifiant, ni cookie : nous ne pouvons pas savoir qui a regardé quoi. Pour ne pas compter deux fois la même visite, l&apos;onglet garde une marque jusqu&apos;à sa fermeture. Cette mesure sert à rendre compte aux exposants de ce que leur stand produit (base légale : notre intérêt légitime, article 6.1.f du RGPD). Quand l&apos;appli d&apos;un mariage est effacée, le salon garde seulement, pour chaque stand qu&apos;elle citait, le nombre de mariages de l&apos;année : ni prénoms, ni date, ni lieu.
        </p>

        <h2>Où et combien de temps</h2>
        <p>
          Les informations des mariés sont enregistrées chez Supabase, sur des serveurs situés en Union européenne (Paris). Le site lui-même est servi par GitHub Pages. Comme tout hébergeur, Supabase et GitHub gardent quelques jours l&apos;adresse technique (IP) des visites dans leurs journaux ; nous ne nous en servons pas.
        </p>
        <p>
          GitHub (GitHub, Inc.) est une société américaine : un accès depuis les États-Unis reste possible, encadré par le cadre de protection des données UE–États-Unis et par les clauses contractuelles types. Supabase (Supabase Pte. Ltd.) est une société de Singapour : les transferts éventuels hors de l&apos;Union européenne sont encadrés par les clauses contractuelles types de la Commission européenne.
        </p>
        <p>
          <b>L&apos;appli et tout son contenu sont effacés 90 jours après la date du mariage.</b> Les mariés peuvent aussi tout effacer avant, d&apos;un bouton, depuis leur lien privé. Les sauvegardes techniques de l&apos;hébergeur disparaissent ensuite d&apos;elles-mêmes, en quelques jours.
        </p>

        <h2>Le code du faire-part</h2>
        <p>
          Le code évite que l&apos;appli s&apos;ouvre pour n&apos;importe qui, mais ce n&apos;est pas un coffre-fort : il est imprimé sur des faire-part. N&apos;y écrivez rien que vous ne mettriez pas sur une invitation (pas de code d&apos;alarme, pas de digicode). Si le code a circulé trop loin, les mariés peuvent le changer depuis leur lien privé.
        </p>

        <h2>Signaler un contenu</h2>
        <p>
          Un texte de l&apos;appli d&apos;un mariage vous semble illicite ? Utilisez le lien « Signaler un contenu » en bas de l&apos;appli, ou écrivez à {mail} avec l&apos;adresse de la page et ce qui pose problème. Nous regardons chaque signalement et vous répondons par écrit.
        </p>

        <h2>Vos droits</h2>
        <p>
          Les mariés corrigent tout eux-mêmes avec leur lien privé, et l&apos;effacent quand ils veulent. Pour toute autre demande (accès, rectification, effacement, limitation, portabilité, opposition), y compris si vous êtes cité dans l&apos;appli d&apos;un mariage, écrivez à {mail} en joignant le lien des invités : réponse sous un mois. Vous pouvez aussi saisir la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).
        </p>

        <p className="appli-maj">Page mise à jour le vendredi 6 novembre 2026.</p>
        <p style={{ marginTop: 20 }}>
          <Link href="/appli-du-mariage/" className="btn btn-ghost">Retour à l&apos;appli du mariage</Link>
        </p>
      </div>
    </section>
  );
}

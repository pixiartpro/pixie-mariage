import { apercu } from "../../../lib/chemin";
import { SALON } from "../../../lib/data";

export const metadata = {
  openGraph: apercu("Les règles du salon — Pixie Mariage", "Le classement ne s'achète pas. Comment on entre au salon, et dans quels cas un stand est retiré."),
  title: "Les règles du salon — Pixie Mariage",
  description:
    "Comment les stands sont classés, comment on entre au salon, et dans quels cas un stand peut être suspendu ou retiré. La position ne se vend jamais.",
};

export default function ReglesDuSalon() {
  return (
    <>
      <section className="partner-hero">
        <div className="container">
          <span className="kicker">Transparence · Pixie Mariage</span>
          <h1>Les règles du salon</h1>
          <p>
            Un salon, même en ligne, a un règlement. Le nôtre tient sur cette
            page : comment les stands sont classés, comment on entre, et dans
            quels cas un stand peut être suspendu ou retiré.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose" style={{ maxWidth: 780 }}>
          <div className="eyebrow">le classement</div>
          <h2 className="section-title">Comment les stands sont ordonnés</h2>
          <p>
            L&apos;ordre d&apos;affichage des stands ne s&apos;achète pas et ne
            se vendra jamais. Les stands sont présentés selon des critères
            simples et identiques pour tous :
          </p>
          <ul>
            <li>
              <strong>La catégorie et les filtres choisis par le visiteur</strong>{" "}
              (métier, recherche par mot-clé) ;
            </li>
            <li>
              <strong>La fraîcheur du stand</strong> : un stand récemment mis à
              jour par son exposant remonte avant un stand inchangé — et toute
              mise à jour compte autant, qu&apos;il s&apos;agisse d&apos;une
              offre rédigée gratuitement ou d&apos;une nouvelle vidéo, quel
              qu&apos;en soit le producteur ;
            </li>
            <li>
              <strong>L&apos;actualité</strong> : pendant une édition du salon,
              les exposants qui y participent avec une offre en cours peuvent
              être regroupés dans une rubrique dédiée, clairement titrée.
            </li>
          </ul>
          <p>
            Aucune rémunération, aucun lien commercial et aucun lien
            capitalistique n&apos;influence cet ordre. Lorsqu&apos;un espace de
            mise en avant payant existe (par exemple « le partenaire du mois »),
            il est affiché <strong>dans un bloc séparé du classement</strong> et
            porte la mention explicite « sponsorisé ». La rédaction (choix des sujets, des
            invités de plateau, des mises à la une éditoriales) ne se vend pas.
          </p>
          <p>
            À savoir : le salon est édité par PIX-I-ART, qui produit également
            les vidéos des stands. Ce lien de prestation est le même pour tous
            les exposants et n&apos;a aucun effet sur l&apos;ordre
            d&apos;affichage.
          </p>
          <p id="studio">
            PIX-I-ART filme aussi des mariages (en direct sur Internet ou en
            film classique, tourné par le studio ou par l&apos;un de ses
            cadreurs partenaires). Cette offre de l&apos;organisateur est
            présentée dans un bloc à part, titré « Le studio organisateur ».
            Ce bloc ne figure pas dans le classement des exposants et
            n&apos;occupe la place d&apos;aucun d&apos;entre eux. PIX-I-ART ne
            figure jamais parmi les vidéastes exposants.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose" style={{ maxWidth: 780 }}>
          <div className="eyebrow">l&apos;entrée</div>
          <h2 className="section-title">Comment on entre au salon</h2>
          <p>
            Un salon ne prend pas n&apos;importe qui, et un stand n&apos;est
            publié que lorsque son exposant remplit trois conditions,
            vérifiées :
          </p>
          <ul>
            <li>une immatriculation active (SIRET) ;</li>
            <li>une assurance responsabilité civile professionnelle à jour ;</li>
            <li>
              la pièce réglementaire propre à son métier lorsqu&apos;elle existe
              (déclaration sanitaire, licence, diplôme…).
            </li>
          </ul>
          <p>
            S&apos;y ajoutent la signature de la charte exposant (répondre aux
            couples, devis écrits, assurance maintenue) et une rencontre avec
            l&apos;équipe du salon. C&apos;est ce que résume le badge
            « Visité par PIX-I-ART » : papiers vérifiés, exposant rencontré.
          </p>
          <p id="videastes">
            <strong>Les vidéastes de mariage.</strong> L&apos;organisateur,
            PIX-I-ART, exerce aussi ce métier. Pour qu&apos;il ne soit jamais à
            la fois juge et concurrent, la catégorie « Vidéastes » suit des
            règles écrites, les mêmes pour tous :
          </p>
          <ul>
            <li>
              les trois conditions d&apos;entrée ci-dessus, la charte et la
              rencontre, comme pour tout exposant ;
            </li>
            <li>
              au moins 10 mariages filmés à La Réunion au cours des deux
              dernières années, avec 3 références vérifiables (couples ou
              lieux) ;
            </li>
            <li>
              un film de mariage réel, complet, que le vidéaste a le droit de
              montrer (accord des mariés, musique sous licence).
            </li>
          </ul>
          <p>
            Le stand d&apos;un vidéaste présente ses propres films :
            PIX-I-ART ne le tourne pas. Il est affiché dans l&apos;ordre public
            du salon, comme tous les autres. Toute décision de refus ou de
            retrait d&apos;un vidéaste est motivée par écrit et cite le critère
            en cause. Les photographes ont leur propre catégorie ; un
            photographe qui propose aussi de la vidéo peut le mentionner sur
            son stand.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose" style={{ maxWidth: 780 }}>
          <div className="eyebrow">suspension &amp; retrait</div>
          <h2 className="section-title">
            Dans quels cas un stand est suspendu ou retiré
          </h2>
          <p>
            Les motifs sont connus d&apos;avance — les voici, en liste fermée :
          </p>
          <ul>
            <li>
              <strong>La perte d&apos;une condition d&apos;entrée</strong>{" "}
              (immatriculation radiée, assurance ou pièce réglementaire
              expirée) : le stand est dépublié automatiquement jusqu&apos;à
              régularisation ;
            </li>
            <li>
              <strong>Un manquement à la charte exposant</strong> : absence
              répétée de réponse aux couples, informations fausses sur le stand,
              pratique commerciale trompeuse ;
            </li>
            <li>
              <strong>Un fait grave signalé et vérifié</strong> mettant en cause
              la sécurité ou la confiance (fraude, mise en danger) ;
            </li>
            <li>
              <strong>Le non-renouvellement de la présence annuelle</strong> :
              le stand est dépublié — jamais effacé — et rouvre au retour de
              l&apos;exposant ;
            </li>
            <li>
              <strong>Une obligation légale ou une décision de justice</strong>{" "}
              imposant le retrait du stand ou d&apos;un contenu.
            </li>
          </ul>
          <p>
            En pratique : toute suspension ou tout retrait est notifié par
            écrit à l&apos;exposant avec son motif. En cas de manquement grave,
            la suspension peut être immédiate ; pour une résiliation, un préavis
            de 30 jours s&apos;applique, sauf obligation légale contraire ou
            manquements graves répétés. Un stand dépublié n&apos;est pas
            effacé : les éléments de l&apos;exposant lui restent restituables.
          </p>
          <p>
            Le salon ne publie pas d&apos;avis : les retours des couples et des
            professionnels sont traités en privé, et c&apos;est
            l&apos;organisateur qui décide, sur pièces.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose" style={{ maxWidth: 780 }}>
          <div className="eyebrow">questions</div>
          <h2 className="section-title">Une question sur ces règles ?</h2>
          <p>
            Écrivez-nous : <a href={`mailto:${SALON.email}`}>{SALON.email}</a>.
            Toute réclamation d&apos;un exposant reçoit une réponse écrite.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose" style={{ maxWidth: 780 }}>
          <div className="eyebrow">médiation</div>
          <h2 className="section-title">Médiation de la consommation</h2>
          <p>
            Conformément aux dispositions du Code de la consommation concernant
            « le processus de médiation des litiges de la consommation »,
            après nous avoir sollicités et à défaut de réponse vous
            satisfaisant, vous avez la possibilité de recourir gratuitement à
            une procédure de médiation de la consommation auprès de :
          </p>
          <address className="mediateur">
            <strong>CM2C</strong>
            <br />
            49 rue de Ponthieu
            <br />
            75 008 PARIS
            <br />
            Tel : 01 89 47 00 14
            <br />
            Site internet :{" "}
            <a href="https://www.cm2c.net/declarer-un-litige.php" target="_blank" rel="noopener">
              https://www.cm2c.net/declarer-un-litige.php
            </a>
            <br />
            Mail : <a href="mailto:litiges@cm2c.net">litiges@cm2c.net</a>
          </address>
        </div>
      </section>
    </>
  );
}

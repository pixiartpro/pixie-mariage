import Link from "next/link";
import { catByKey } from "../lib/data";
import { catGrad } from "../lib/theme";

export default function PrestataireCard({ p }) {
  const cat = catByKey(p.categorie);
  return (
    <Link href={`/prestataire/${p.slug}`} className="presta-card">
      <div className="thumb" style={{ background: catGrad(p.categorie) }}>
        <i className={`ti ti-${cat ? cat.icon : "heart"} ic`} aria-hidden="true" />
        <span className="cat-tag">{cat ? cat.nom : ""}</span>
        <span className="play" title="Vidéo de présentation">
          <i className="ti ti-player-play" aria-hidden="true" />
        </span>
      </div>
      <div className="presta-body">
        <h3>{p.nom}</h3>
        <div className="ville">
          <i className="ti ti-map-pin" aria-hidden="true" />
          {p.ville}
        </div>
        <div className="accroche">« {p.accroche} »</div>
        <div className="presta-foot">
          <span className="prix">{p.prix}</span>
        </div>
      </div>
    </Link>
  );
}

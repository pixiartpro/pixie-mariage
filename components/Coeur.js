"use client";

// Le cœur : mettre un stand de côté dans « Ma sélection ».
import { useEffect, useState } from "react";
import { basculer, estChoisi, ecouter } from "../lib/selection";

export default function Coeur({ slug, nom, grand = false }) {
  const [choisi, setChoisi] = useState(false);
  useEffect(() => {
    const maj = () => setChoisi(estChoisi(slug));
    maj();
    return ecouter(maj);
  }, [slug]);
  const label = choisi ? `Retirer ${nom} de ma sélection` : `Mettre ${nom} dans ma sélection`;
  if (grand)
    return (
      <button type="button" className={`btn btn-ghost coeur-grand ${choisi ? "on" : ""}`} aria-pressed={choisi} onClick={() => basculer(slug)}>
        <i className={`ti ${choisi ? "ti-heart-filled" : "ti-heart"}`} aria-hidden="true" />
        {choisi ? "Dans ma sélection" : "Mettre dans ma sélection"}
      </button>
    );
  return (
    <button type="button" className={`coeur ${choisi ? "on" : ""}`} aria-pressed={choisi} aria-label={label} title={label} onClick={() => basculer(slug)}>
      <i className={`ti ${choisi ? "ti-heart-filled" : "ti-heart"}`} aria-hidden="true" />
    </button>
  );
}

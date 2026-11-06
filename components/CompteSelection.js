"use client";

// Le lien « Ma sélection » du menu, avec le nombre de stands mis de côté.
import { useEffect, useState } from "react";
import Link from "next/link";
import { lireSelection, ecouter } from "../lib/selection";

export default function CompteSelection() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const maj = () => setN(lireSelection().length);
    maj();
    return ecouter(maj);
  }, []);
  return (
    <Link href="/ma-selection" className="nav-selection" aria-label={`Ma sélection : ${n} stand${n > 1 ? "s" : ""}`}>
      <i className={`ti ${n ? "ti-heart-filled" : "ti-heart"}`} aria-hidden="true" />
      <span className="hide-mobile">Ma sélection</span>
      {n > 0 && <span className="nav-compte">{n}</span>}
    </Link>
  );
}

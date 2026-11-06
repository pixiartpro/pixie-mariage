"use client";

// Les chiffres des stands : +1 au total du jour, sans cookie ni identifiant.
import { useEffect } from "react";
import { compter } from "../../lib/appli/stockage";

// Une seule fois par fiche et par visite d'onglet, pour ne pas compter les rechargements.
export function CompteurVue({ slug }) {
  useEffect(() => {
    const k = `pm:vu:${slug}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    compter(slug, "vue");
    if (new URLSearchParams(window.location.search).get("depuis") === "mariage") compter(slug, "depuis_mariage");
  }, [slug]);
  return null;
}

export function LienContact({ slug, href, className, children }) {
  return (
    <a href={href} className={className} onClick={() => compter(slug, "contact")}>
      {children}
    </a>
  );
}

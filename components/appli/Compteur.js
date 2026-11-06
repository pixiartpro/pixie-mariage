"use client";

// Les chiffres des stands : +1 au total du jour, sans cookie ni identifiant.
import { useEffect } from "react";
import { compter } from "../../lib/appli/stockage";

export function CompteurVue({ slug }) {
  useEffect(() => {
    let dejaVu = false;
    let depuisMariage = false;
    try {
      // Une seule vue par fiche et par onglet : un rechargement ne compte pas deux fois.
      dejaVu = !!sessionStorage.getItem(`pm:vu:${slug}`);
      sessionStorage.setItem(`pm:vu:${slug}`, "1");
      // « Venu d'une appli de mariage » : seulement après un vrai clic dans l'appli d'un mariage, pas un lien qui circule.
      depuisMariage = sessionStorage.getItem("pm:depuis-mariage") === slug;
      if (depuisMariage) sessionStorage.removeItem("pm:depuis-mariage");
    } catch {}
    if (!dejaVu) compter(slug, "vue");
    if (depuisMariage) compter(slug, "depuis_mariage");
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

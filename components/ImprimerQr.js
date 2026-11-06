"use client";
// Un QR code sans bouton (pour les pages à imprimer), avec l'adresse complète du site en production.
import { SITE } from "../lib/chemin";
import QrCode from "./appli/QrCode";

export default function ImprimerQr({ chemin, taille = 150, label = "QR code" }) {
  // Toujours l'adresse publique, même imprimé depuis le Mac : un QR vers « localhost » ne marcherait chez personne.
  return <QrCode texte={`${SITE}${chemin}`} taille={taille} sansBouton label={label} />;
}

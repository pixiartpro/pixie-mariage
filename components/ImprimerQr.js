"use client";
// Un QR code sans bouton (pour les pages à imprimer), avec l'adresse complète du site en production.
import { useEffect, useState } from "react";
import { PREFIXE } from "../lib/chemin";
import QrCode from "./appli/QrCode";

export default function ImprimerQr({ chemin, taille = 150, label = "QR code" }) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(`${window.location.origin}${PREFIXE}${chemin}`), [chemin]);
  return url ? <QrCode texte={url} taille={taille} sansBouton label={label} /> : <div style={{ width: taille, height: taille }} />;
}

"use client";

// Le bouton « Demander un devis » avec trois cases facultatives : la demande part de la messagerie du couple, directement chez le prestataire.
import { useEffect, useState } from "react";
import { lireProjet, ecrireProjet, mailDevis } from "../lib/projet";
import { compter } from "../lib/appli/stockage";

export default function ContactPrecis({ email, slug }) {
  const [p, setP] = useState({ date: "", commune: "", invites: "" });
  useEffect(() => setP(lireProjet()), []);
  const maj = (k, v) => {
    const n = { ...p, [k]: v };
    setP(n);
    ecrireProjet(n);
  };
  return (
    <div className="contact-precis">
      <p className="contact-aide">Pour une réponse précise (facultatif) :</p>
      <div className="contact-cases">
        <label>
          <span>Date</span>
          <input type="date" value={p.date} onChange={(e) => maj("date", e.target.value)} />
        </label>
        <label>
          <span>Commune</span>
          <input value={p.commune} maxLength={60} onChange={(e) => maj("commune", e.target.value)} placeholder="Saint-Paul" />
        </label>
        <label>
          <span>Invités</span>
          <input inputMode="numeric" value={p.invites} onChange={(e) => maj("invites", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="120" />
        </label>
      </div>
      <a href={mailDevis(email, p)} className="btn btn-rose" onClick={() => compter(slug, "contact")}>
        <i className="ti ti-mail" aria-hidden="true" /> Demander un devis
      </a>
      <p className="contact-aide">Ces trois cases restent sur votre appareil et préremplissent vos autres demandes.</p>
    </div>
  );
}

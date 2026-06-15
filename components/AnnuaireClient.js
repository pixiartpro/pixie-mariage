"use client";
import { useState, useEffect } from "react";
import { CATEGORIES, PRESTATAIRES } from "../lib/data";
import PrestataireCard from "./PrestataireCard";

export default function AnnuaireClient() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("cat");
    if (p && CATEGORIES.some((c) => c.key === p)) setCat(p);
  }, []);

  function choose(key) {
    setCat(key);
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", key);
    window.history.replaceState(null, "", url);
  }

  const s = q.trim().toLowerCase();
  const list = PRESTATAIRES.filter((p) => {
    const okCat = cat === "all" || p.categorie === cat;
    const okQ =
      !s || `${p.nom} ${p.ville} ${p.accroche} ${p.categorie}`.toLowerCase().includes(s);
    return okCat && okQ;
  });

  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow">l&apos;annuaire</div>
        <h1 className="section-title">Les prestataires de votre mariage</h1>
        <p className="section-sub">Tous à La Réunion, présentés en vidéo, disponibles toute l&apos;année.</p>

        <div className="filter-bar">
          <div className="search">
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher un prestataire, une ville…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Rechercher un prestataire"
            />
          </div>
        </div>

        <div className="chips" style={{ marginBottom: 22 }}>
          <button className={`chip-f ${cat === "all" ? "on" : ""}`} onClick={() => choose("all")}>
            Tout
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`chip-f ${cat === c.key ? "on" : ""}`}
              onClick={() => choose(c.key)}
            >
              {c.nom}
            </button>
          ))}
        </div>

        <p className="result-count">
          {list.length} prestataire{list.length > 1 ? "s" : ""}
        </p>

        {list.length ? (
          <div className="presta-grid">
            {list.map((p) => (
              <PrestataireCard key={p.slug} p={p} />
            ))}
          </div>
        ) : (
          <div className="muted" style={{ padding: "40px 0", textAlign: "center" }}>
            Aucun prestataire pour ce filtre.
          </div>
        )}
      </div>
    </section>
  );
}

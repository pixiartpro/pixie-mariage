"use client";

// QR code dessiné sur place (aucun service extérieur), et téléchargeable en image pour le faire-part.
import { useMemo } from "react";
import qrcode from "qrcode-generator";

function matrice(texte) {
  const q = qrcode(0, "M");
  q.addData(texte);
  q.make();
  const n = q.getModuleCount();
  const cases = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) cases.push([c, r]);
  return { n, cases };
}

export default function QrCode({ texte, taille = 180, nomFichier = "qr-code-mariage.png" }) {
  const { n, cases } = useMemo(() => matrice(texte), [texte]);
  const marge = 4;
  const total = n + marge * 2;
  const chemin = cases.map(([x, y]) => `M${x + marge} ${y + marge}h1v1h-1z`).join("");

  const telecharger = () => {
    const echelle = 16;
    const cv = document.createElement("canvas");
    cv.width = cv.height = total * echelle;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#000";
    cases.forEach(([x, y]) => ctx.fillRect((x + marge) * echelle, (y + marge) * echelle, echelle, echelle));
    const a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="qr">
      <svg viewBox={`0 0 ${total} ${total}`} width={taille} height={taille} role="img" aria-label="QR code du lien des invités" shapeRendering="crispEdges">
        <rect width={total} height={total} fill="#fff" />
        <path d={chemin} fill="#000" />
      </svg>
      <button type="button" className="btn btn-ghost btn-sm" onClick={telecharger}>
        <i className="ti ti-download" aria-hidden="true" /> Télécharger le QR code
      </button>
    </div>
  );
}

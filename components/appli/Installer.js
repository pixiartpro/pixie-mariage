"use client";

// « Mettre l'appli sur mon téléphone » : le vrai bouton sur Android, le geste à faire sur iPhone.
import { useEffect, useState } from "react";

export default function Installer() {
  const [invite, setInvite] = useState(null);
  const [ios, setIos] = useState(false);
  const [installee, setInstallee] = useState(false);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setInstallee(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const f = (e) => {
      e.preventDefault();
      setInvite(e);
    };
    window.addEventListener("beforeinstallprompt", f);
    return () => window.removeEventListener("beforeinstallprompt", f);
  }, []);

  if (installee || (!invite && !ios)) return null;

  return (
    <section className="ap-installer">
      {invite ? (
        <button
          type="button"
          className="ap-btn ap-btn-clair"
          onClick={async () => {
            invite.prompt();
            await invite.userChoice.catch(() => {});
            setInvite(null);
          }}
        >
          <i className="ti ti-device-mobile-down" aria-hidden="true" /> Mettre l&apos;appli sur mon téléphone
        </button>
      ) : (
        <>
          <button type="button" className="ap-btn ap-btn-clair" aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>
            <i className="ti ti-device-mobile-down" aria-hidden="true" /> Mettre l&apos;appli sur mon iPhone
          </button>
          {ouvert && (
            <p className="ap-sous ap-centre-txt">
              Touchez <i className="ti ti-share-2" aria-label="Partager" /> en bas de Safari, puis « Sur l&apos;écran d&apos;accueil ».
            </p>
          )}
        </>
      )}
    </section>
  );
}

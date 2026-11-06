// Le mariage de démonstration (inventé) : ouvert sans code, à l'adresse /mariage/?m=demo.
// Il sert au salon de Nordev et aux exposants : il montre l'appli sans aucune donnée réelle.
export const MARIAGE_DEMO = {
  annonce: "",
  contenu: {
    prenoms: ["Léa", "Mathis"],
    date: "2026-12-12",
    lieu: { nom: "Le Domaine des Flamboyants", ville: "Saint-Paul", adresse: "" },
    infos: [
      { titre: "Parking", texte: "Sur place, 80 places" },
      { titre: "Accès", texte: "Portail ouvert dès 15 h" },
      { titre: "Tenue", texte: "Chic, tons clairs" },
      { titre: "Navette", texte: "Retour à 1 h et 2 h" },
    ],
    programme: [
      { heure: "15:30", titre: "Accueil des invités", detail: "Rafraîchissements à l'ombre des flamboyants" },
      { heure: "16:00", titre: "Cérémonie laïque", detail: "Sous le grand flamboyant, face au lagon" },
      { heure: "17:00", titre: "Vin d'honneur", detail: "Sur la terrasse, bouchons et samoussas" },
      { heure: "19:00", titre: "Coucher de soleil", detail: "Photo de groupe sur la pelouse" },
      { heure: "19:30", titre: "Dîner", detail: "Dans la salle des Flamboyants" },
      { heure: "22:00", titre: "Ouverture du bal", detail: "Puis la piste est à vous" },
      { heure: "00:30", titre: "Le gâteau", detail: "Et la dernière navette à 2 h" },
    ],
    reponse: { lien: "", avant_le: "2026-11-20" },
    conseil: "Le soleil se couche vers 19 h sur le lagon, juste après le vin d'honneur. Le meilleur moment pour une photo de groupe.",
    photos_soir: "",
    apres: {
      merci: "Merci d'avoir été là. On a regardé le teaser dix fois. À très vite.",
      teaser: "",
      film: "",
      galerie: "",
      tirages: "",
    },
    prestataires: [
      { slug: "domaine-des-flamboyants", role: "Le lieu" },
      { slug: "instant-precieux-wedding", role: "L'organisation" },
      { slug: "saveurs-de-bourbon-traiteur", role: "Le repas" },
      { slug: "lumiere-australe-studio", role: "Les photos" },
      { slug: "fleurs-de-corail", role: "Les fleurs" },
      { slug: "son-des-iles-dj", role: "La musique" },
      { slug: "douceurs-de-leila", role: "Le gâteau" },
    ],
  },
};

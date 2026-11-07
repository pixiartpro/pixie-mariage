// La démonstration de l'espace pro (inventée de bout en bout) : /espace-pro/.
// Elle sert au salon de Nordev (samedi 21/11/2026) : montrer l'outil aux pros avant de le construire pour de vrai.
// Le pro est une fiche d'exemple du salon, et son premier mariage est le mariage de démonstration
// de l'appli des mariés (Léa & Mathis, /mariage/?m=demo) : c'est le lien entre les deux outils.
// Rien n'est enregistré : tout repart de zéro au rechargement de la page.

import { MARIAGE_DEMO } from "./demo";
import { decaler } from "./pro";

const M = MARIAGE_DEMO.contenu;

export const PRO_DEMO = {
  stand: "lumiere-australe-studio",
  metier: "photographe",
  role: "Les photos",
  libres: ["2026-11-28", "2026-12-05", "2026-12-19", "2027-01-09", "2027-01-16", "2027-01-30", "2027-02-13", "2027-03-13", "2027-03-20"],
  mariages: [
    { id: "lea-mathis", prenoms: M.prenoms, date: M.date, lieu: { nom: M.lieu.nom, ville: M.lieu.ville }, role: "Les photos", appli: "demo" },
    { id: "emilie-thomas", prenoms: ["Émilie", "Thomas"], date: "2027-04-17", lieu: { nom: "Case Kréol Réceptions", ville: "Cilaos" }, role: "Les photos", appli: "" },
  ],
  // il_y_a : reçue il y a tant de jours (la démo reste fraîche quel que soit le jour où on l'ouvre).
  demandes: [
    {
      id: "anais-kevin",
      prenoms: ["Anaïs", "Kévin"],
      date: "2027-01-16",
      ville: "Saint-Pierre",
      invites: 120,
      il_y_a: 1,
      etape: "nouvelle",
      message: "Bonjour ! Nous nous marions à Saint-Pierre, cérémonie laïque en extérieur puis réception. Nous aimerions un reportage des préparatifs jusqu'à l'ouverture du bal. Êtes-vous disponible ce jour-là, et quels sont vos tarifs ?",
    },
    {
      id: "melissa-johan",
      prenoms: ["Mélissa", "Johan"],
      date: "2026-12-12",
      ville: "L'Étang-Salé",
      invites: 90,
      il_y_a: 2,
      etape: "nouvelle",
      message: "Bonsoir, êtes-vous libre le 12 décembre ? Petit mariage sur la plage de l'Étang-Salé, environ 90 personnes. Merci !",
    },
    {
      id: "sarah-yohann",
      prenoms: ["Sarah", "Yohann"],
      date: "2027-02-13",
      ville: "Saint-Leu",
      invites: 150,
      il_y_a: 6,
      etape: "devis",
      message: "Bonjour, nous avons vu votre stand sur Pixie Mariage et nous adorons vos photos au coucher du soleil. Mariage à Saint-Leu, 150 invités. Pouvez-vous nous envoyer un devis pour la journée complète, avec le drone ?",
    },
    {
      id: "chloe-dylan",
      prenoms: ["Chloé", "Dylan"],
      date: "2027-03-06",
      ville: "Sainte-Marie",
      invites: 60,
      il_y_a: 9,
      etape: "repondu",
      message: "Bonjour, mariage intime à Sainte-Marie, une soixantaine de personnes. Faites-vous des demi-journées ?",
    },
  ],
};

// L'état de départ de la démonstration, avec les dates de réception calculées depuis aujourd'hui.
export function etatDemoPro(aujourdhui) {
  return {
    libres: [...PRO_DEMO.libres],
    mariages: PRO_DEMO.mariages.map((m) => ({ ...m })),
    demandes: PRO_DEMO.demandes.map(({ il_y_a, ...d }) => ({ ...d, recue: decaler(aujourdhui, -il_y_a) })),
  };
}

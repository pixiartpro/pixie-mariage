// Dégradés élégants par catégorie (pour les vignettes des fiches en l'absence de photo réelle).
const CAT_STYLE = {
  "salles": "linear-gradient(135deg,#C98B8B,#8E4F4F)",
  "traiteurs": "linear-gradient(135deg,#CDA24B,#937326)",
  "photographes": "linear-gradient(135deg,#8A7C9A,#534E73)",
  "fleuristes": "linear-gradient(135deg,#CF8FA6,#9A3556)",
  "dj-musique": "linear-gradient(135deg,#6B7FA3,#3F5474)",
  "wedding-planner": "linear-gradient(135deg,#B08A6B,#7E5E40)",
  "deco-location": "linear-gradient(135deg,#8DA07A,#5C7551)",
  "patisserie": "linear-gradient(135deg,#D6A98F,#A9785A)",
  "beaute": "linear-gradient(135deg,#CF93B1,#8E3D63)",
  "tenues": "linear-gradient(135deg,#9AA0A8,#666C74)",
};
export const catGrad = (key) => CAT_STYLE[key] || "linear-gradient(135deg,#C98B8B,#8E4F4F)";

// Le préfixe du site en ligne (GitHub Pages sert le site sous /pixie-mariage).
// À utiliser seulement là où Next ne l'ajoute pas tout seul (manifeste, icônes, liens absolus).
export const PREFIXE = process.env.NODE_ENV === "production" ? "/pixie-mariage" : "";
export const SITE = "https://pixiartpro.github.io/pixie-mariage";

#!/bin/sh
# Met le site en ligne sur Vercel, SEULEMENT si la construction et les tests passent, puis vérifie que ce qui est
# en ligne est exactement ce qui vient d'être construit, octet pour octet (contrôle commun du socle, transfert [12]).
# Le projet Vercel est relié au dépôt GitHub : Vercel construit lui-même chaque enregistrement envoyé sur main.
# Le numéro de construction est l'enregistrement git (next.config.mjs) : la construction de Vercel et celle du Mac
# sont donc identiques, et le contrôle peut les comparer.
# À lancer depuis main, après le oui de Guillaume. Usage : npm run publier
set -eu
DEPOT=pixiartpro/pixie-mariage
SITE=$(sed -n 's/^export const SITE = "\(.*\)";$/\1/p' lib/chemin.js)
VERIF="$HOME/Desktop/claude code/outils/socle-mise-en-ligne/verifier-mise-en-ligne.sh"
[ -n "$SITE" ] || { echo "ARRÊT : l'adresse du site est introuvable dans lib/chemin.js"; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "ARRÊT : il faut être sur main"; exit 1; }
[ -z "$(git status --porcelain -- app components lib public contenu supabase tests scripts package.json package-lock.json next.config.mjs vercel.json)" ] || { echo "ARRÊT : des changements ne sont pas enregistrés"; exit 1; }
[ -f "$VERIF" ] || { echo "ARRÊT : le contrôle « en ligne = dépôt » est introuvable : $VERIF"; exit 1; }
git fetch -q origin
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "ARRÊT : GitHub a des changements que ce Mac n'a pas"; exit 1; }
npm run build                # la même construction que celle que Vercel va faire (s'arrête ici si elle échoue)
npm test                     # tests du site, liens internes compris
SHA=$(git rev-parse HEAD)
git push -q origin main      # Vercel construit et met en ligne cet enregistrement
echo "ENVOYÉ ($SITE). Attente de la mise en ligne par Vercel…"
# Vercel annonce chaque mise en ligne à GitHub (déploiement « Production », état « success ») : on l'attend.
ETAT=""
for i in $(seq 1 60); do       # 10 minutes au plus
  ID=$(gh api "repos/$DEPOT/deployments?sha=$SHA&environment=Production" --jq '.[0].id // empty' 2>/dev/null || true)
  if [ -n "$ID" ]; then
    ETAT=$(gh api "repos/$DEPOT/deployments/$ID/statuses" --jq '.[0].state // empty' 2>/dev/null || true)
    case "$ETAT" in
      success) break ;;
      failure|error) echo "ARRÊT : Vercel n'a pas pu mettre en ligne (état : $ETAT). Voir le projet sur vercel.com."; exit 1 ;;
    esac
  fi
  sleep 10
done
[ "$ETAT" = "success" ] || echo "(Vercel n'a pas confirmé à temps : le contrôle attend lui-même)"
zsh "$VERIF" --site "$SITE" --depot . --publie out --attente 8 --secours "npm run publier"
echo "EN LIGNE"

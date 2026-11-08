#!/bin/sh
# Met le site en ligne sur GitHub Pages, SEULEMENT si la construction et les tests passent,
# puis vérifie que ce qui est en ligne est exactement ce qui vient d'être publié, octet pour octet
# (contrôle commun du socle, transfert [12] de l'analyse croisée du dimanche 08/11/2026).
# À lancer depuis main, après le oui de Guillaume. Usage : npm run publier -- "message"
# Le code (main) part sur GitHub dans la foulée : le dépôt et le site en ligne restent au même niveau.
set -eu
MSG=${1:-"Deploy"}
SITE=https://pixiartpro.github.io/pixie-mariage
DEPOT=pixiartpro/pixie-mariage
VERIF="$HOME/Desktop/claude code/outils/socle-mise-en-ligne/verifier-mise-en-ligne.sh"
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "ARRÊT : il faut être sur main"; exit 1; }
[ -z "$(git status --porcelain -- app components lib public contenu supabase tests package.json scripts)" ] || { echo "ARRÊT : des changements ne sont pas enregistrés"; exit 1; }
[ -f "$VERIF" ] || { echo "ARRÊT : le contrôle « en ligne = dépôt » est introuvable : $VERIF"; exit 1; }
git fetch -q origin
[ "$(git rev-list --count HEAD..origin/main)" = "0" ] || { echo "ARRÊT : GitHub a des changements que ce Mac n'a pas"; exit 1; }
npm run build                # s'arrête ici si la construction échoue (set -e)
npm test                     # tests du site, liens internes compris
TMP=$(mktemp -d /tmp/pm-ghp.XXXXXX)
git worktree add -q "$TMP" origin/gh-pages --detach
rsync -a --delete --exclude .git --exclude .nojekyll out/ "$TMP/"
touch "$TMP/.nojekyll"
( cd "$TMP" && git add -A && git commit -q -m "$MSG" && git push -q origin HEAD:gh-pages && git log --oneline -1 )
git worktree remove --force "$TMP"
git push -q origin main      # le code du site, au même niveau que la version publiée
echo "ENVOYÉ. Attente de la fin du déploiement de GitHub Pages…"
# GitHub met environ une minute à publier. On attend la fin de son déploiement, pour comparer une seule fois
# (un passage du contrôle prend plusieurs minutes : environ 330 fichiers, chacun redemandé en ligne).
SHA=$(git rev-parse origin/gh-pages)
RUN=""
for i in 1 2 3 4 5 6 7 8 9 10; do
  RUN=$(gh run list --repo "$DEPOT" --limit 5 --json databaseId,headSha --jq ".[] | select(.headSha==\"$SHA\") | .databaseId" 2>/dev/null | head -1) || RUN=""
  [ -n "$RUN" ] && break
  sleep 3
done
if [ -n "$RUN" ]; then
  gh run watch "$RUN" --repo "$DEPOT" --exit-status >/dev/null 2>&1 || echo "Le déploiement de GitHub signale un problème : le contrôle va le montrer."
else
  echo "(déploiement de GitHub non suivi : le contrôle attend lui-même)"
fi
zsh "$VERIF" --site "$SITE" --depot . --publie out --attente 8 --secours "npm run publier -- \"$MSG\""
echo "EN LIGNE"

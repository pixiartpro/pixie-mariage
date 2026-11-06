#!/bin/sh
# Met le site en ligne sur GitHub Pages, SEULEMENT si la construction et les tests passent.
# À lancer depuis main, après le oui de Guillaume. Usage : npm run publier -- "message"
set -eu
MSG=${1:-"Deploy"}
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "ARRÊT : il faut être sur main"; exit 1; }
[ -z "$(git status --porcelain -- app components lib public contenu supabase tests package.json)" ] || { echo "ARRÊT : des changements ne sont pas enregistrés"; exit 1; }
npm run build                # s'arrête ici si la construction échoue (set -e)
npm test                     # tests du site, liens internes compris
TMP=$(mktemp -d /tmp/pm-ghp.XXXXXX)
git fetch -q origin
git worktree add -q "$TMP" origin/gh-pages --detach
rsync -a --delete --exclude .git --exclude .nojekyll out/ "$TMP/"
touch "$TMP/.nojekyll"
( cd "$TMP" && git add -A && git commit -q -m "$MSG" && git push -q origin HEAD:gh-pages && git log --oneline -1 )
git worktree remove --force "$TMP"
echo "EN LIGNE"

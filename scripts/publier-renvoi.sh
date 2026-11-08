#!/bin/sh
# Remplace l'ancien site de GitHub Pages par les pages de renvoi (scripts/renvoi-github.mjs).
# SEULEMENT sur le oui de Guillaume, et APRÈS la première mise en ligne sur Vercel : sinon les QR mèneraient nulle part.
# Usage : sh scripts/publier-renvoi.sh
set -eu
ANCIEN=https://pixiartpro.github.io/pixie-mariage
SITE=$(sed -n 's/^export const SITE = "\(.*\)";$/\1/p' lib/chemin.js)
[ -n "$SITE" ] || { echo "ARRÊT : l'adresse du site est introuvable dans lib/chemin.js"; exit 1; }
# Les pages visées par les QR déjà imprimés : une seule liste, contenu/qr-imprimes.json.
QR=$(node -e 'console.log(require("./contenu/qr-imprimes.json").qr.map((q) => q.page).join(" "))')
# 1. Le nouveau site doit répondre, avec les pages visées par les QR imprimés.
for p in / $QR; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE$p")
  [ "$code" = "200" ] || { echo "ARRÊT : $SITE$p répond $code. On ne renvoie pas les anciennes pages vers un site qui ne répond pas."; exit 1; }
done
# 2. Les pages de renvoi, fabriquées depuis le site construit.
npm run build
node scripts/renvoi-github.mjs
# 3. Elles remplacent l'ancien site sur la branche gh-pages.
TMP=$(mktemp -d /tmp/pm-renvoi.XXXXXX)
git fetch -q origin
git worktree add -q "$TMP" origin/gh-pages --detach
rsync -a --delete --exclude .git renvoi/ "$TMP/"
( cd "$TMP" && git add -A && git commit -q -m "Pixie Mariage a déménagé : chaque ancienne page renvoie vers $SITE" && git push -q origin HEAD:gh-pages && git log --oneline -1 )
git worktree remove --force "$TMP"
# 4. Contrôle : les anciennes adresses des QR renvoient bien vers la nouvelle (après le déploiement de GitHub Pages).
echo "Envoyé. Contrôle des anciennes adresses (GitHub Pages met environ une minute)…"
for essai in $(seq 1 30); do
  bon=0
  for p in $QR; do
    curl -s "$ANCIEN$p?nc=$essai" | grep -q "location.replace(\"$SITE\"" && bon=$((bon + 1))
  done
  [ "$bon" = "$(echo $QR | wc -w | tr -d ' ')" ] && { echo "RENVOI EN PLACE : les anciennes adresses mènent à $SITE"; exit 0; }
  sleep 10
done
echo "ATTENTION : après 5 minutes, les anciennes adresses ne renvoient pas encore. Recontrôler à la main."; exit 1

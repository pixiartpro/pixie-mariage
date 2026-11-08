#!/bin/sh
# Écrit <dossier>/.htaccess (règles de sécurité de Hostinger) depuis htaccess.modele.
# connect-src = l'adresse du projet Supabase avec laquelle le site a été construit (NEXT_PUBLIC_SUPABASE_URL) :
# la même variable que le site, donc jamais une adresse de base qui ne serait pas la sienne.
# Usage : NEXT_PUBLIC_SUPABASE_URL=https://<identifiant>.supabase.co sh hebergement/hostinger/poser-htaccess.sh out
set -eu
ICI=$(cd "$(dirname "$0")" && pwd)
DOSSIER=${1:?"indiquer le dossier publié, par exemple : out"}
URL=${NEXT_PUBLIC_SUPABASE_URL:-}
echo "$URL" | grep -Eq '^https://[a-z0-9]{20}\.supabase\.co$' || {
  echo "ARRÊT : NEXT_PUBLIC_SUPABASE_URL doit être l'adresse https://<20 lettres ou chiffres>.supabase.co du projet de Pixie Mariage (reçu : « $URL »)"
  exit 1
}
[ -d "$DOSSIER" ] || { echo "ARRÊT : le dossier « $DOSSIER » n'existe pas (lancer npm run build d'abord)"; exit 1; }
sed "s#__SUPABASE_URL__#$URL#g" "$ICI/htaccess.modele" > "$DOSSIER/.htaccess"
if grep -q "__SUPABASE_URL__" "$DOSSIER/.htaccess"; then echo "ARRÊT : l'adresse de la base n'a pas été posée"; exit 1; fi
echo "écrit : $DOSSIER/.htaccess (connect-src $URL)"

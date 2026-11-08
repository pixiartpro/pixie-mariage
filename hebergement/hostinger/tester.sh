#!/bin/sh
# Teste les règles de Hostinger (htaccess.modele) sur l'Apache du Mac, sans rien mettre en ligne.
# Usage : npm run build, puis npm run test:hostinger
set -eu
ICI=$(cd "$(dirname "$0")" && pwd)
RACINE=$(cd "$ICI/../.." && pwd)
[ -f "$RACINE/out/index.html" ] || { echo "ARRÊT : lancer npm run build d'abord"; exit 1; }
D=$(mktemp -d /tmp/pm-apache.XXXXXX)
PORT=55488
BASE=https://abcdefghijklmnopqrst.supabase.co   # adresse de base inventée, pour le test
cp -R "$RACINE/out" "$D/site"
NEXT_PUBLIC_SUPABASE_URL=$BASE sh "$ICI/poser-htaccess.sh" "$D/site" >/dev/null
M=/usr/libexec/apache2
cat > "$D/httpd.conf" <<EOF
ServerRoot "$D"
Listen 127.0.0.1:$PORT
ServerName pixie-mariage.re
PidFile "$D/httpd.pid"
ErrorLog "$D/error.log"
LoadModule mpm_prefork_module $M/mod_mpm_prefork.so
LoadModule unixd_module $M/mod_unixd.so
LoadModule authz_core_module $M/mod_authz_core.so
LoadModule dir_module $M/mod_dir.so
LoadModule mime_module $M/mod_mime.so
LoadModule headers_module $M/mod_headers.so
LoadModule rewrite_module $M/mod_rewrite.so
TypesConfig /private/etc/apache2/mime.types
DocumentRoot "$D/site"
DirectoryIndex index.html
<Directory "$D/site">
  AllowOverride All
  Require all granted
</Directory>
<Files ".ht*">
  Require all denied
</Files>
EOF
/usr/sbin/httpd -f "$D/httpd.conf" -k start
trap '/usr/sbin/httpd -f "$D/httpd.conf" -k stop >/dev/null 2>&1 || true; rm -rf "$D"' EXIT
U="http://127.0.0.1:$PORT"
curl -s --retry 20 --retry-connrefused --retry-delay 1 -o /dev/null "$U/"

ECHECS=0
doit() { if [ "$1" = "$2" ]; then echo "ok : $3"; else echo "ÉCHEC : $3 (attendu « $2 », obtenu « $1 »)"; ECHECS=$((ECHECS + 1)); fi; }
entete() { curl -sI -H 'X-Forwarded-Proto: https' "$U$1" | tr -d '\r' | grep -i "^$2:" | head -1 | cut -d' ' -f2-; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

# Les en-têtes de sécurité, sur une page, sur une page de l'appli et sur la page d'erreur.
for p in / /annuaire/ /mariage/ /nexiste-pas/; do
  doit "$(entete "$p" Strict-Transport-Security)" "max-age=31536000; includeSubDomains" "HSTS sur $p"
  doit "$(entete "$p" X-Frame-Options)" "DENY" "anti-cadre sur $p"
  doit "$(entete "$p" X-Content-Type-Options)" "nosniff" "nosniff sur $p"
  doit "$(entete "$p" Referrer-Policy)" "strict-origin-when-cross-origin" "Referrer-Policy sur $p"
  doit "$(entete "$p" Cross-Origin-Opener-Policy)" "same-origin" "COOP sur $p"
  CSP=$(entete "$p" Content-Security-Policy)
  doit "$(echo "$CSP" | grep -c "connect-src 'self' $BASE;")" "1" "CSP : la page ne parle qu'à sa propre base, sur $p"
  doit "$(echo "$CSP" | grep -c "frame-ancestors 'none'")" "1" "CSP : jamais dans le cadre d'un autre site, sur $p"
  doit "$(echo "$CSP" | grep -c "default-src 'self'")" "1" "CSP : rien d'autre que le site lui-même, sur $p"
done
doit "$(entete / Permissions-Policy)" "camera=(), microphone=(), geolocation=(), payment=(), usb=()" "Permissions-Policy"
doit "$(entete / Cache-Control)" "no-cache" "les pages sont toujours redemandées"
# Les pages répondent, la page d'erreur est celle du site, le fichier de règles ne se lit pas.
doit "$(code -H 'X-Forwarded-Proto: https' "$U/")" "200" "l'accueil répond"
doit "$(code -H 'X-Forwarded-Proto: https' "$U/annuaire/")" "200" "les stands répondent"
doit "$(code -H 'X-Forwarded-Proto: https' "$U/nexiste-pas/")" "404" "une adresse inconnue répond 404"
doit "$(curl -s -H 'X-Forwarded-Proto: https' "$U/nexiste-pas/" | grep -c 'Pixie Mariage' | tr -d ' ' | cut -c1)" "1" "la page 404 est celle du site"
doit "$(code -H 'X-Forwarded-Proto: https' "$U/.htaccess")" "403" "le fichier de règles ne se télécharge pas"
# Toujours en https, toujours sans www.
doit "$(curl -sI "$U/annuaire/" | tr -d '\r' | grep -i '^location:' | cut -d' ' -f2)" "https://pixie-mariage.re/annuaire/" "http renvoie vers https, page gardée"
doit "$(curl -sI -H 'Host: www.pixie-mariage.re' -H 'X-Forwarded-Proto: https' "$U/annuaire/?cat=salles" | tr -d '\r' | grep -i '^location:' | cut -d' ' -f2)" "https://pixie-mariage.re/annuaire/?cat=salles" "www renvoie vers l'adresse sans www, recherche gardée"
# Un .htaccess sans adresse de base valable n'est jamais écrit.
doit "$(NEXT_PUBLIC_SUPABASE_URL=https://evil.example/x.supabase.co sh "$ICI/poser-htaccess.sh" "$D/site" >/dev/null 2>&1 && echo écrit || echo refusé)" "refusé" "une fausse adresse de base est refusée"

[ "$ECHECS" -eq 0 ] && echo "HOSTINGER : TOUS LES TESTS PASSENT" || { echo "HOSTINGER : $ECHECS ÉCHEC(S)"; exit 1; }

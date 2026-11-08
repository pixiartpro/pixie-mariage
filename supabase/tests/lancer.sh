#!/bin/sh
# Teste supabase/schema.sql sur un Postgres jetable, sur le Mac (rien ne touche à Supabase en ligne).
# Usage : npm run test:sql
set -e
export LANG=C LC_ALL=C PATH=/opt/homebrew/bin:/usr/bin:/bin
ICI=$(cd "$(dirname "$0")" && pwd)
# Les tests posent un compteur pour l'heure ou le jour en cours, puis créent : à cheval sur un changement d'heure (UTC,
# qui est aussi celui du jour à La Réunion, UTC+4), un test échouerait alors que le code est juste (relecture ChatGPT du
# 08/11/2026, tour 2). Le banc dure moins d'une minute : il attend donc que les minutes 58 et 59 soient passées.
while [ "$(date -u +%M)" -ge 58 ]; do echo "(changement d'heure imminent : le banc attend)"; sleep 10; done
D=$(mktemp -d /tmp/pm-sql.XXXXXX)
PORT=55499
trap 'pg_ctl -D "$D/data" stop -m fast >/dev/null 2>&1 || true; rm -rf "$D"' EXIT
initdb -D "$D/data" -U postgres --auth=trust -E UTF8 --no-locale >/dev/null
pg_ctl -D "$D/data" -o "-p $PORT -k '' -c listen_addresses=127.0.0.1" -l "$D/log" -w start >/dev/null
P="psql -h 127.0.0.1 -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
# Ce que Supabase fournit déjà : les rôles, le schéma des extensions, les droits par défaut, et pg_cron (simulé ici).
$P <<'SQL'
create role anon nologin; create role authenticated nologin;
create schema extensions; grant usage on schema public, extensions to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
create schema cron; create table cron.job(jobname text, schedule text, command text);
create function cron.schedule(a text, b text, c text) returns bigint language sql as $$ insert into cron.job values (a, b, c) returning 1::bigint $$;
-- Le coffre de Supabase (Vault), simulé : des secrets que seul le propriétaire des fonctions lit.
create schema vault;
create table vault.secrets(id uuid primary key default gen_random_uuid(), name text unique, secret text not null, description text);
create view vault.decrypted_secrets as select id, name, secret as decrypted_secret, description from vault.secrets;
create function vault.create_secret(new_secret text, new_name text default null, new_description text default '') returns uuid language sql
  as $$ insert into vault.secrets(name, secret, description) values (new_name, new_secret, new_description) returning id $$;
SQL
sed 's/^create extension if not exists pg_cron;/-- pg_cron simulé pour le test/' "$ICI/../schema.sql" | $P
$P -f "$ICI/tests.sql"
# Deux créations au même instant : une seule doit passer (relecture Codex du 08/11/2026 : avec l'ancien comptage, les
# deux passaient à 199, soit 201). La 1re session crée puis garde sa transaction ouverte 2 s ; la 2e part 0,5 s après.
# On exige que la 2e ATTENDE la 1re (preuve qu'elles se chevauchent vraiment), qu'elle soit refusée pour le bon motif,
# et qu'une seule appli de plus existe (relecture ChatGPT du 08/11/2026 : un simple compte n = 200 ne disait ni qui
# avait réussi, ni pourquoi l'autre avait échoué).
DATE=$(date -v+30d +%Y-%m-%d)
deux_en_meme_temps() { # $1 = ce qu'on teste, $2 = l'appel SQL, $3 = adresse de la 1re, $4 = adresse de la 2e, $5 = début du motif de refus
  $P -c "begin; select set_config('request.headers', '{\"x-forwarded-for\": \"$3\"}', true); select $2; select pg_sleep(2); commit;" > "$D/premier.out" 2>&1 &
  sleep 0.5
  $P -c "select set_config('request.headers', '{\"x-forwarded-for\": \"$4\"}', false); do \$\$ declare t0 timestamptz := clock_timestamp(); begin begin perform $2; raise notice 'RESULTAT accepte'; exception when others then raise notice 'RESULTAT refus : %', sqlerrm; end; raise notice 'ATTENTE %', round(extract(epoch from clock_timestamp() - t0)::numeric, 1); end \$\$;" > "$D/second.out" 2>&1
  wait
  ATTENTE=$(sed -n 's/.*ATTENTE \([0-9.]*\).*/\1/p' "$D/second.out")
  if grep -q ERROR "$D/premier.out"; then echo "ÉCHEC : $1 : la 1re a échoué"; cat "$D/premier.out"; exit 1; fi
  grep -q "RESULTAT refus : PM: $5" "$D/second.out" || { echo "ÉCHEC : $1 : la 2e n'a pas été refusée pour le motif attendu ($5…)"; cat "$D/second.out"; exit 1; }
  awk -v a="$ATTENTE" 'BEGIN { exit !(a >= 1.0) }' || { echo "ÉCHEC : $1 : la 2e n'a pas attendu la 1re (${ATTENTE:-?} s), elles ne se sont pas chevauchées"; exit 1; }
  echo "ok : $1 (une seule passe ; l'autre attend $ATTENTE s, puis est refusée)"
}
# Le site entier : deux créations au même instant, à 199 dans l'heure.
$P -c "delete from public.creations_par_heure; delete from public.visiteurs; insert into public.creations_par_heure values (date_trunc('hour', now(), 'UTC'), 199);"
AVANT=$($P -tAc "select count(*) from public.mariages")
deux_en_meme_temps "deux créations simultanées à 199 dans l'heure" "public.mariage_creer('{\"prenoms\":[\"Simul\",\"Tane\"],\"date\":\"$DATE\"}'::jsonb)" 198.51.100.21 198.51.100.22 "Trop de cr"
grep -q '"slug"' "$D/premier.out" || { echo "ÉCHEC : la 1re création n'a pas rendu son appli"; exit 1; }
APRES=$($P -tAc "select count(*) from public.mariages"); N=$($P -tAc "select n from public.creations_par_heure")
[ $((APRES - AVANT)) = 1 ] && [ "$N" = "200" ] || { echo "ÉCHEC : $((APRES - AVANT)) applis de plus et $N comptées dans l'heure (attendu 1 et 200)"; exit 1; }
# Le plafond du visiteur SEUL (appelé directement) : sinon la 2e session attend déjà sur le compteur du site, et le test
# ne prouverait rien sur celui du visiteur (relecture ChatGPT du 08/11/2026, tour 2). Le même visiteur, déjà à 9.
$P -c "delete from public.creations_par_heure; delete from public.visiteurs; select set_config('request.headers', '{\"x-forwarded-for\": \"198.51.100.30\"}', false); insert into public.visiteurs values (public.pm_empreinte_visiteur(), 'creer_mariage', (now() at time zone 'Indian/Reunion')::date, 9);"
deux_en_meme_temps "le plafond du visiteur seul, deux appels simultanés à 9 dans la journée" "public.pm_plafond_visiteur('creer_mariage', 10)" 198.51.100.30 198.51.100.30 "Vous avez d"
V=$($P -tAc "select n from public.visiteurs")
[ "$V" = "10" ] || { echo "ÉCHEC : $V créations comptées pour ce visiteur (attendu 10)"; exit 1; }
echo "BASE : TOUS LES TESTS PASSENT"

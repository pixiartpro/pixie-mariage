#!/bin/sh
# Teste supabase/schema.sql sur un Postgres jetable, sur le Mac (rien ne touche à Supabase en ligne).
# Usage : npm run test:sql
set -e
export LANG=C LC_ALL=C PATH=/opt/homebrew/bin:/usr/bin:/bin
ICI=$(cd "$(dirname "$0")" && pwd)
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
echo "BASE : TOUS LES TESTS PASSENT"

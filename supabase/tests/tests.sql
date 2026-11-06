-- Tests de la base Pixie Mariage. Chaque bloc s'arrête net (exception) si un résultat est faux.
create or replace function pg_temp.doit(ok boolean, quoi text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'ÉCHEC : %', quoi; end if; raise notice 'ok : %', quoi; end $$;
create or replace function pg_temp.refuse(sql text, quoi text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok (refusé) : %', quoi; return; end;
  raise exception 'ÉCHEC, accepté à tort : %', quoi;
end $$;

-- Le public ne voit aucune table, et n'appelle que les fonctions prévues.
select pg_temp.doit(not has_table_privilege('anon', 'public.mariages', 'select'), 'tables fermées au public');
select pg_temp.doit(not has_function_privilege('anon', 'public.exposant_creer(text)', 'execute'), 'exposant_creer réservé à PIX-I-ART');
select pg_temp.doit(not has_function_privilege('anon', 'public.mariages_purger()', 'execute'), 'purge réservée');
select pg_temp.doit(not has_function_privilege('authenticated', 'public.mariage_creer(jsonb)', 'execute'), 'authenticated fermé');
create function public.fonction_future() returns int language sql as $$ select 1 $$;
select pg_temp.doit(not has_function_privilege('anon', 'public.fonction_future()', 'execute'), 'une future fonction reste fermée');
drop function public.fonction_future();
-- Les fonctions publiques, elles, sont ouvertes au public (les appels ci-dessous tournent ensuite comme le propriétaire : SECURITY DEFINER).
select pg_temp.doit(has_function_privilege('anon', f, 'execute'), 'ouverte au public : ' || f) from unnest(array[
  'public.mariage_creer(jsonb)', 'public.mariage_lire(text,text)', 'public.mariage_ouvrir(text,text)', 'public.mariage_modifier(text,text,jsonb,text)',
  'public.mariage_nouveau_code(text,text)', 'public.mariage_annoncer(text,text,text)', 'public.mariage_supprimer(text,text)',
  'public.compter(text,text)', 'public.exposant_chiffres(text,text)']) f;
select pg_temp.doit(exists (select 1 from cron.job where jobname = 'pm-purge-mariages'), 'effacement de nuit programmé');

create temp table r as select public.mariage_creer(('{"prenoms":["Léa","Mathis"],"date":"' || (current_date + 30) || '","prestataires":[{"slug":"fleurs-de-corail"}]}')::jsonb)::jsonb as j;
select pg_temp.doit((select j->>'slug' from r) ~ '^lea-mathis-[a-z0-9]{6}$', 'adresse lisible avec les prénoms sans accent');
select pg_temp.doit(public.mariage_lire((select j->>'slug' from r), (select lower(j->>'code') from r)) is not null, 'lecture avec le code, même en minuscules');
select pg_temp.doit(public.mariage_lire((select j->>'slug' from r), 'AAAAAA') is null, 'mauvais code : rien');
select pg_temp.doit(public.mariage_ouvrir((select j->>'slug' from r), 'faux') is null, 'mauvaise clé : rien');
select pg_temp.refuse($$select public.mariage_creer('{"prenoms":["a","b"],"date":"today"}')$$, 'date « today »');
select pg_temp.refuse($$select public.mariage_creer('{"prenoms":["a",""],"date":"2026-12-12"}')$$, 'un prénom vide');
select pg_temp.refuse($$select public.mariage_creer('{"prenoms":["a","b"],"date":"2035-01-01"}')$$, 'date à plus de deux ans');
select pg_temp.refuse($$select public.mariage_creer(jsonb_build_object('prenoms', jsonb_build_array('a','b'), 'date', (current_date+5)::text, 'x', repeat('z', 20000)))$$, 'contenu trop gros');
select pg_temp.refuse($$select public.mariage_annoncer((select j->>'slug' from r), 'faux', 'pirate')$$, 'annonce sans la clé');
select pg_temp.refuse($$select public.mariage_supprimer((select j->>'slug' from r), 'faux')$$, 'effacement sans la clé');

-- Modifier avec la version ; une version périmée est refusée ; l'annonce ne change pas la version.
create temp table v as select public.mariage_ouvrir((select j->>'slug' from r), (select j->>'cle' from r))->>'version' as x;
create temp table v2 as select public.mariage_modifier((select j->>'slug' from r), (select j->>'cle' from r), ('{"prenoms":["Léa","Mathis"],"date":"' || (current_date + 30) || '","prestataires":[{"slug":"fleurs-de-corail"}]}')::jsonb, (select x from v)) as x;
select pg_temp.refuse($$select public.mariage_modifier((select j->>'slug' from r), (select j->>'cle' from r), '{"prenoms":["L","M"],"date":"2026-12-12"}', (select x from v))$$, 'version périmée');
select public.mariage_annoncer((select j->>'slug' from r), (select j->>'cle' from r), '  Sous le kiosque  ');
select pg_temp.doit(public.mariage_lire((select j->>'slug' from r), (select j->>'code' from r))->>'annonce' = 'Sous le kiosque', 'le mot des mariés, nettoyé');
select pg_temp.doit(public.mariage_ouvrir((select j->>'slug' from r), (select j->>'cle' from r))->>'version' = (select x from v2), 'l''annonce ne change pas la version');

-- Après le mariage : les mariés ajoutent encore le film.
update public.mariages set date_mariage = current_date - 10, contenu = jsonb_set(contenu, '{date}', to_jsonb((current_date - 10)::text));
select pg_temp.doit(public.mariage_modifier((select j->>'slug' from r), (select j->>'cle' from r),
  jsonb_set((public.mariage_ouvrir((select j->>'slug' from r), (select j->>'cle' from r))->'contenu')::jsonb, '{apres}', '{"film":"https://x"}'),
  public.mariage_ouvrir((select j->>'slug' from r), (select j->>'cle' from r))->>'version') is not null, 'film ajouté après le mariage');
-- Nouveau code : l'ancien ne marche plus.
create temp table c2 as select public.mariage_nouveau_code((select j->>'slug' from r), (select j->>'cle' from r)) as x;
select pg_temp.doit(public.mariage_lire((select j->>'slug' from r), (select j->>'code' from r)) is null, 'ancien code mort');
select pg_temp.doit(public.mariage_lire((select j->>'slug' from r), (select x from c2)) is not null, 'nouveau code bon');

-- Les chiffres des exposants : rien pour un stand non signé, plafond par jour, mariages comptés s'ils ont été ouverts.
select public.compter('fleurs-de-corail', 'vue');
select pg_temp.doit((select count(*) from public.compteurs) = 0, 'stand non signé : rien compté');
create temp table ke as select public.exposant_creer('fleurs-de-corail') as x;
insert into public.compteurs values ('fleurs-de-corail', 'vue', (now() at time zone 'Indian/Reunion')::date, 1999);
select public.compter('fleurs-de-corail', 'vue'); select public.compter('fleurs-de-corail', 'vue'); select public.compter('fleurs-de-corail', 'contact'); select public.compter('fleurs-de-corail', 'pirate');
create temp table ch as select public.exposant_chiffres('fleurs-de-corail', (select x from ke))::jsonb as j;
select pg_temp.doit((select (j->'mois'->>'vue')::int from ch) = 2000, 'vues plafonnées à 2 000 par jour');
select pg_temp.doit((select (j->'mois'->>'contact')::int from ch) = 1, 'clic contact compté');
select pg_temp.doit((select (j->>'mariages')::int from ch) = 1, 'le mariage ouvert par un invité compte');
select pg_temp.doit((select json_array_length((j->'jours')::json) from ch) = 30, '30 jours dans le graphique');
select pg_temp.doit(public.exposant_chiffres('fleurs-de-corail', 'mauvaise') is null, 'chiffres sans la clé : rien');

-- L'effacement à 90 jours.
insert into public.mariages (slug, code, cle_hash, contenu, date_mariage) values ('vieux-aaaaaa', 'ABCDEF', public.pm_hash('k'), '{}', current_date - 100);
select pg_temp.doit(public.mariage_lire('vieux-aaaaaa', 'ABCDEF') is null, 'mariage de plus de 90 jours fermé');
select pg_temp.doit(public.mariages_purger() = 1, 'la purge efface le vieux mariage');

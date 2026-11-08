-- Tests de la base Pixie Mariage. Chaque bloc s'arrête net (exception) si un résultat est faux.
create or replace function pg_temp.doit(ok boolean, quoi text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'ÉCHEC : %', quoi; end if; raise notice 'ok : %', quoi; end $$;
-- motif (facultatif) : un morceau du message d'erreur attendu. Sans lui, n'importe quel refus suffit ; avec lui, un refus
-- pour une autre raison fait échouer le test (relecture ChatGPT du 08/11/2026 : sinon, on ne sait pas QUI a refusé).
create or replace function pg_temp.refuse(sql text, quoi text, motif text default null) returns void language plpgsql as $$
begin
  begin execute sql;
  exception when others then
    if motif is not null and position(motif in sqlerrm) = 0 then
      raise exception 'ÉCHEC, refusé pour une autre raison : % (attendu « % », reçu « % »)', quoi, motif, sqlerrm;
    end if;
    raise notice 'ok (refusé) : %', quoi; return;
  end;
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

-- Le compteur des mariages survit à l'effacement à 90 jours : la preuve pour le renouvellement du stand.
update public.mariages set date_mariage = current_date - 100 where slug = (select j->>'slug' from r);
select pg_temp.doit(public.mariages_purger() = 1, 'le mariage de Léa et Mathis est effacé à son tour');
select pg_temp.doit((select count(*) from public.mariages) = 0, 'plus aucun mariage gardé');
create temp table ch2 as select public.exposant_chiffres('fleurs-de-corail', (select x from ke))::jsonb as j;
select pg_temp.doit((select (j->>'mariages')::int from ch2) = 1, 'le mariage effacé compte encore pour le stand');
select pg_temp.doit((select (j->'mariages_par_annee'->>extract(year from current_date - 100)::int::text)::int from ch2) = 1, 'compté dans l''année du mariage');
select pg_temp.doit((select count(*) from public.mariages_cites where slug = 'fleurs-de-corail') = 1, 'une seule ligne gardée : le stand, l''année, le nombre');
-- Ne comptent pas : un mariage jamais ouvert, un mariage effacé par les mariés avant la fête.
-- Comptent une fois : un stand cité deux fois ; un mariage effacé par les mariés après la fête. Un stand non signé est ignoré.
insert into public.mariages (slug, code, cle_hash, contenu, date_mariage, lu_le) values
  ('jamais-ouvert', 'ABCDEF', public.pm_hash('k1'), '{"prestataires":[{"slug":"fleurs-de-corail"}]}', current_date - 100, null),
  ('annule-avant', 'ABCDEF', public.pm_hash('k2'), '{"prestataires":[{"slug":"fleurs-de-corail"}]}', current_date + 20, now()),
  ('double', 'ABCDEF', public.pm_hash('k3'), '{"prestataires":[{"slug":"fleurs-de-corail"},{"slug":"fleurs-de-corail"},{"slug":"stand-inconnu"},{"nom":"Sans stand"}]}', current_date - 100, now()),
  ('efface-apres', 'ABCDEF', public.pm_hash('k4'), '{"prestataires":[{"slug":"fleurs-de-corail"}]}', current_date - 10, now()),
  ('sans-liste', 'ABCDEF', public.pm_hash('k5'), '{"prestataires":"pas une liste"}', current_date - 100, now());
select public.mariage_supprimer('annule-avant', 'k2');
select public.mariage_supprimer('efface-apres', 'k4');
select pg_temp.doit(public.mariages_purger() = 3, 'les trois vieux mariages effacés, sans erreur sur une liste abîmée');
create temp table ch3 as select public.exposant_chiffres('fleurs-de-corail', (select x from ke))::jsonb as j;
select pg_temp.doit((select (j->>'mariages')::int from ch3) = 3, 'Léa et Mathis, le doublon et l''effacé après la fête : 3 mariages');
select pg_temp.doit(not has_table_privilege('anon', 'public.mariages_cites', 'select'), 'le compteur des mariages reste fermé au public');
select pg_temp.doit(not has_function_privilege('anon', 'public.pm_garder_citations()', 'execute'), 'le déclencheur n''est pas appelable');

-- ---------- Contre les robots : 10 créations par jour et par visiteur, connu par une empreinte de son adresse ----------
select pg_temp.doit(not has_table_privilege('anon', 'public.visiteurs', 'select'), 'les empreintes sont fermées au public');
select pg_temp.doit(not has_function_privilege('anon', f, 'execute'), 'réservée à la base : ' || f) from unnest(array[
  'public.pm_empreinte_visiteur()', 'public.pm_plafond_visiteur(text,integer)', 'public.visiteurs_purger()']) f;
select pg_temp.doit(not has_schema_privilege('anon', 'vault', 'usage'), 'le coffre est fermé au public');
select pg_temp.doit((select count(*) from vault.secrets where name = 'pm_cle_visiteurs' and length(secret) = 64) = 1, 'une clé de 32 octets tirée au hasard, une seule fois');
select pg_temp.doit(exists (select 1 from cron.job where jobname = 'pm-purge-visiteurs'), 'effacement des empreintes programmé');
delete from public.visiteurs;
-- Le même visiteur (sa première adresse de x-forwarded-for) : 10 créations passent, la 11e est refusée.
select set_config('request.headers', '{"x-forwarded-for": "203.0.113.7, 10.0.0.1"}', false);
select public.mariage_creer(('{"prenoms":["Robot","N' || i || '"],"date":"' || (current_date + 30) || '"}')::jsonb) from generate_series(1, 10) i;
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Robot","Onze"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, '11e création du même visiteur le même jour', 'plusieurs applis');
select pg_temp.doit((select n from public.visiteurs) = 10, 'le refus ne fait pas grimper le compte');
-- L'adresse posée par Cloudflare passe avant x-forwarded-for (qu'un robot peut écrire lui-même).
select set_config('request.headers', '{"cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "1.2.3.4"}', false);
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Robot","Masque"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, 'un faux x-forwarded-for ne contourne pas le plafond', 'plusieurs applis');
-- Un autre visiteur crée sans gêne.
select set_config('request.headers', '{"x-forwarded-for": "198.51.100.9"}', false);
select pg_temp.doit(public.mariage_creer(('{"prenoms":["Nina","Teva"],"date":"' || (current_date + 40) || '"}')::jsonb) is not null, 'un autre visiteur crée sans gêne');
-- Jamais l'adresse en clair : seulement des empreintes de 64 caractères, différentes d'un visiteur à l'autre.
select pg_temp.doit((select count(*) from public.visiteurs) = 2, 'deux visiteurs, deux empreintes');
select pg_temp.doit((select bool_and(empreinte ~ '^[0-9a-f]{64}$' and strpos(empreinte, '.') = 0) from public.visiteurs), 'aucune adresse en clair : 64 chiffres hexadécimaux, jamais de point');
create temp table empreintes as select
  encode(extensions.hmac('visiteur:' || to_char((now() at time zone 'Indian/Reunion')::date, 'YYYY-MM-DD') || ':198.51.100.9', (select secret from vault.secrets where name = 'pm_cle_visiteurs'), 'sha256'), 'hex') as aujourdhui,
  encode(extensions.hmac('visiteur:' || to_char((now() at time zone 'Indian/Reunion')::date - 1, 'YYYY-MM-DD') || ':198.51.100.9', (select secret from vault.secrets where name = 'pm_cle_visiteurs'), 'sha256'), 'hex') as hier;
select pg_temp.doit(public.pm_empreinte_visiteur() = (select aujourdhui from empreintes), 'empreinte = HMAC-SHA256 de la date du jour et de l''adresse, avec la clé du coffre');
select pg_temp.doit(public.pm_empreinte_visiteur() <> (select hier from empreintes), 'l''empreinte change chaque jour : celle d''hier ne se relie pas à celle d''aujourd''hui');
set datestyle = 'SQL, DMY';
select pg_temp.doit(public.pm_empreinte_visiteur() = (select aujourdhui from empreintes), 'même empreinte quel que soit l''affichage des dates de la session');
reset datestyle;
-- Ménage : les jours passés sont effacés, aujourd'hui reste.
insert into public.visiteurs values (repeat('a', 64), 'creer_mariage', (now() at time zone 'Indian/Reunion')::date - 1, 3);
select pg_temp.doit(public.visiteurs_purger() = 1, 'les empreintes d''hier sont effacées au passage suivant');
select pg_temp.doit((select count(*) from public.visiteurs) = 2, 'celles du jour restent pour tenir le plafond');
-- Sans clé dans le coffre, on ne crée rien (jamais de création sans plafond).
delete from vault.secrets where name = 'pm_cle_visiteurs';
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Sans","Cle"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, 'pas de clé, pas de création', 'La création est fermée');
select set_config('request.headers', '', false);

-- ---------- Le plafond global de l'heure (relecture Codex du dimanche 08/11/2026, défauts rejoués avant correction) ----------
-- La clé revient au coffre (le test précédent l'a retirée).
insert into vault.secrets (name, secret) values ('pm_cle_visiteurs', encode(extensions.gen_random_bytes(32), 'hex'));
delete from public.visiteurs; delete from public.creations_par_heure;
select pg_temp.doit(not has_table_privilege('anon', 'public.creations_par_heure', 'select'), 'le compteur de l''heure est fermé au public');
select pg_temp.doit(not has_function_privilege('anon', 'public.pm_plafond_global(integer)', 'execute'), 'le plafond global n''est pas appelable par le public');
insert into public.creations_par_heure values (date_trunc('hour', now(), 'UTC'), 199);
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.10"}', false);
create temp table g as select public.mariage_creer(('{"prenoms":["Kim","Noa"],"date":"' || (current_date + 30) || '"}')::jsonb)::jsonb as j;
select pg_temp.doit((select n from public.creations_par_heure) = 200, '200e création de l''heure acceptée');
-- Avant : effacer une appli rendait sa place, et la 201e passait.
select public.mariage_supprimer((select j->>'slug' from g), (select j->>'cle' from g));
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.11"}', false);
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Robot","Apres"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, '201e création de l''heure, même après l''effacement d''une appli', 'Trop de créations');
select pg_temp.doit((select n from public.creations_par_heure) = 200, 'le refus ne fait pas grimper le compte de l''heure');
-- Le fuseau de la requête ne doit pas ouvrir un autre compteur. PostgREST laisse un visiteur choisir le fuseau de sa
-- requête (en-tête « Prefer: timezone=… », documentation de PostgREST 12), et date_trunc('hour', …) découpe l'heure
-- dans ce fuseau : décalé d'une demi-heure ou de trois quarts d'heure, un robot tombait sur une autre ligne, donc
-- jusqu'à trois compteurs de 200 à la fois (trouvé le dimanche 08/11/2026 en relisant la remarque de ChatGPT).
set time zone 'Asia/Kolkata';
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.12"}', false);
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Robot","Fuseau"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, '201e création refusée, même dans un fuseau décalé d''une demi-heure', 'Trop de créations');
set time zone 'Asia/Kathmandu';
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.13"}', false);
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Robot","Quart"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, '201e création refusée, même dans un fuseau décalé de trois quarts d''heure', 'Trop de créations');
reset time zone;
select pg_temp.doit((select count(*) from public.creations_par_heure) = 1, 'un seul compteur pour l''heure, quel que soit le fuseau de la requête');
-- Avant : une seule purge par nuit ; si elle échouait, une empreinte vivait 51 h. Maintenant chaque heure.
select pg_temp.doit((select schedule from cron.job where jobname = 'pm-purge-visiteurs') = '27 * * * *', 'effacement des empreintes chaque heure (48 h tenues même si un passage échoue)');
insert into public.creations_par_heure values (date_trunc('hour', now(), 'UTC') - interval '3 days', 5);
select public.visiteurs_purger();
select pg_temp.doit((select count(*) from public.creations_par_heure) = 1, 'les compteurs de plus de deux jours sont effacés');
-- Une erreur APRÈS l'incrément de l'heure (ici le plafond du visiteur, vérifié juste après) n'use pas le filet global
-- et ne laisse aucune appli : tout s'annule ensemble (test demandé par la relecture ChatGPT du 08/11/2026).
delete from public.creations_par_heure; delete from public.visiteurs;
insert into public.creations_par_heure values (date_trunc('hour', now(), 'UTC'), 50);
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.14"}', false);
insert into public.visiteurs values (public.pm_empreinte_visiteur(), 'creer_mariage', (now() at time zone 'Indian/Reunion')::date, 10);
create temp table avant as select count(*) as n from public.mariages;
select pg_temp.refuse($$select public.mariage_creer(('{"prenoms":["Robot","Tard"],"date":"' || (current_date + 30) || '"}')::jsonb)$$, '11e création du visiteur, refusée après l''incrément de l''heure', 'plusieurs applis');
select pg_temp.doit((select n from public.creations_par_heure) = 50, 'le refus du visiteur annule aussi l''incrément de l''heure');
select pg_temp.doit((select count(*) from public.mariages) = (select n from avant), 'et ne laisse aucune appli');
-- Fenêtre fixe, assumée (voir le schéma) : l'heure d'avant, même pleine, ne bloque pas l'heure en cours.
delete from public.creations_par_heure;
insert into public.creations_par_heure values (date_trunc('hour', now(), 'UTC') - interval '1 hour', 200);
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.16"}', false);
select pg_temp.doit(public.mariage_creer(('{"prenoms":["Heure","Neuve"],"date":"' || (current_date + 30) || '"}')::jsonb) is not null, 'fenêtre fixe : l''heure d''avant, pleine, ne bloque pas l''heure en cours');
-- Joué sous le VRAI rôle du public (anon), pas seulement lu dans les droits : les fonctions et les tables internes
-- refusent, la porte prévue s'ouvre (test demandé par la relecture ChatGPT du 08/11/2026).
select set_config('request.headers', '{"x-forwarded-for": "192.0.2.15"}', false);
set role anon;
do $$
declare essai text; refuse boolean;
begin
  foreach essai in array array[
    'select public.pm_plafond_global(100000)',
    'select public.pm_plafond_visiteur(''creer_mariage'', 100000)',
    'select public.pm_empreinte_visiteur()',
    'select public.visiteurs_purger()',
    'select public.mariages_purger()',
    'insert into public.creations_par_heure values (now(), 0)',
    'update public.creations_par_heure set n = 0',
    'delete from public.visiteurs',
    'select count(*) from public.mariages']
  loop
    refuse := false;
    begin execute essai; exception when insufficient_privilege then refuse := true; end;
    if not refuse then raise exception 'ÉCHEC, accepté à tort sous anon : %', essai; end if;
    raise notice 'ok (refusé sous anon) : %', essai;
  end loop;
  if public.mariage_creer(('{"prenoms":["Anon","Porte"],"date":"' || (current_date + 30) || '"}')::jsonb) is null then
    raise exception 'ÉCHEC : sous anon, la création prévue ne passe pas';
  end if;
  raise notice 'ok : sous anon, la création passe par la porte prévue';
end $$;
reset role;
select pg_temp.doit((select n from public.creations_par_heure where heure = date_trunc('hour', now(), 'UTC')) = 2, 'la création faite sous anon est bien comptée dans l''heure');
select set_config('request.headers', '', false);

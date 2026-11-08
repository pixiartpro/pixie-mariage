-- ============================================================
-- Pixie Mariage — base de l'appli du mariage et des chiffres des stands
-- Projet Supabase dédié (jamais celui de Bob / du CASE).
-- Principe : AUCUN accès direct aux tables pour le public. Tout passe par des
-- fonctions qui vérifient le code (invités) ou la clé (mariés, exposants).
-- Pour tout défaire : supabase/rollback.sql
-- ============================================================

create extension if not exists pgcrypto with schema extensions;
-- L'effacement automatique à 90 jours en dépend : sans pg_cron, le script s'arrête (jamais d'effacement promis et pas fait).
create extension if not exists pg_cron;

-- ---------- Les tables ----------
create table if not exists public.mariages (
  slug         text primary key check (slug ~ '^[a-z0-9-]{1,80}$'),
  code         text not null check (code ~ '^[A-Z0-9]{6}$'),
  cle_hash     bytea not null,
  contenu      jsonb not null,
  date_mariage date not null,
  annonce      text check (char_length(annonce) <= 280),
  annonce_le   timestamptz,
  lu_le        timestamptz,                 -- dernière ouverture par un invité (sert à ne compter que les vrais mariages)
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now()
);

create table if not exists public.exposants (
  slug     text primary key check (slug ~ '^[a-z0-9-]{1,80}$'),
  cle_hash bytea not null,
  cree_le  timestamptz not null default now()
);

-- Des totaux par jour, sans adresse IP, sans identifiant, sans cookie.
create table if not exists public.compteurs (
  slug text not null references public.exposants(slug) on delete cascade,
  type text not null check (type in ('vue', 'contact', 'depuis_mariage')),
  jour date not null default (now() at time zone 'Indian/Reunion')::date,
  n    integer not null default 0,
  primary key (slug, type, jour)
);

-- Ce qui survit à l'effacement des mariages : pour chaque stand, le nombre de mariages qui l'ont cité, par année.
-- Ni prénoms, ni date, ni lieu : la preuve pour le renouvellement annuel, sans rien garder des mariés.
create table if not exists public.mariages_cites (
  slug  text not null references public.exposants(slug) on delete cascade,
  annee integer not null,
  n     integer not null default 0,
  primary key (slug, annee)
);

alter table public.mariages  enable row level security;
alter table public.exposants enable row level security;
alter table public.compteurs enable row level security;
alter table public.mariages_cites enable row level security;
create index if not exists mariages_cree_le on public.mariages (cree_le);
create index if not exists mariages_date on public.mariages (date_mariage);
-- Aucune règle d'accès (policy) : sans fonction, personne ne lit ni n'écrit.
revoke all on public.mariages, public.exposants, public.compteurs, public.mariages_cites from anon, authenticated;

-- ---------- Outils internes ----------
create or replace function public.pm_hasard(n int, alphabet text)
returns text language sql volatile set search_path = '' as $$
  select string_agg(substr(alphabet, (get_byte(b, i) % length(alphabet)) + 1, 1), '')
  from (select extensions.gen_random_bytes(n) as b) x, generate_series(0, n - 1) as i
$$;

create or replace function public.pm_hash(cle text)
returns bytea language sql immutable set search_path = '' as $$
  select extensions.digest(coalesce(cle, ''), 'sha256')
$$;

-- Vérifie la forme d'un mariage reçu et rend sa date.
-- p_ancienne : la date déjà enregistrée (modification). Si elle ne change pas, pas de contrôle de plage :
-- les mariés doivent pouvoir ajouter le film et la galerie APRÈS le mariage.
create or replace function public.pm_verifier(p_contenu jsonb, p_ancienne date default null)
returns date language plpgsql set search_path = '' as $$
declare d date; aujourdhui date := (now() at time zone 'Indian/Reunion')::date;
begin
  if p_contenu is null or jsonb_typeof(p_contenu) <> 'object' then raise exception 'PM: Contenu illisible.'; end if;
  if octet_length(p_contenu::text) > 16000 then raise exception 'PM: Trop de texte : raccourcissez un peu.'; end if;
  if coalesce(trim(p_contenu->'prenoms'->>0), '') = '' or coalesce(trim(p_contenu->'prenoms'->>1), '') = '' then
    raise exception 'PM: Il manque les deux prénoms.';
  end if;
  if coalesce(p_contenu->>'date', '') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'PM: La date du mariage est illisible.'; end if;
  begin
    d := (p_contenu->>'date')::date;
  exception when others then
    raise exception 'PM: La date du mariage est illisible.';
  end;
  if (jsonb_typeof(p_contenu->'programme') = 'array' and jsonb_array_length(p_contenu->'programme') > 20)
     or (jsonb_typeof(p_contenu->'prestataires') = 'array' and jsonb_array_length(p_contenu->'prestataires') > 20)
     or (jsonb_typeof(p_contenu->'infos') = 'array' and jsonb_array_length(p_contenu->'infos') > 12) then
    raise exception 'PM: Trop de lignes.';
  end if;
  if p_ancienne is distinct from d and (d < aujourdhui - 1 or d > aujourdhui + 800) then
    raise exception 'PM: La date doit être dans les deux prochaines années.';
  end if;
  return d;
end $$;

-- ---------- Contre les robots : un plafond de créations par visiteur et par jour ----------
-- Un visiteur n'est connu que par une EMPREINTE de son adresse internet : un HMAC-SHA256 calculé avec une clé tirée
-- au hasard dans le coffre de Supabase (Vault), que personne ne voit ni ne tape. L'adresse elle-même n'est jamais
-- enregistrée, et l'empreinte est effacée dans l'heure qui suit la fin de son jour (48 h au plus, page « vos données »).
-- L'adresse lue : celle que pose Cloudflare (cf-connecting-ip, qu'un visiteur ne peut pas imposer), sinon la première
-- de x-forwarded-for (méthode de la documentation de Supabase). Le plafond global de 200 créations par heure reste
-- le dernier filet contre un robot qui changerait d'adresse.
-- À vérifier le jour de la création de la base : quels en-têtes le projet reçoit vraiment (cf-connecting-ip ou non).
create table if not exists public.visiteurs (
  empreinte text not null check (empreinte ~ '^[0-9a-f]{64}$'),
  action    text not null check (action in ('creer_mariage')),
  jour      date not null default (now() at time zone 'Indian/Reunion')::date,
  n         integer not null default 0,
  primary key (empreinte, action, jour)
);
alter table public.visiteurs enable row level security;
revoke all on public.visiteurs from anon, authenticated;

-- La clé, tirée UNE fois dans le coffre. Sans le coffre (supabase_vault), le script s'arrête ici.
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'pm_cle_visiteurs',
  'Pixie Mariage : clé des empreintes de visiteurs (plafond anti-robots)')
where not exists (select 1 from vault.secrets where name = 'pm_cle_visiteurs');

create or replace function public.pm_empreinte_visiteur()
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  e   jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  ip  text := btrim(coalesce(nullif(btrim(e->>'cf-connecting-ip'), ''), split_part(coalesce(e->>'x-forwarded-for', ''), ',', 1)));
  cle text := (select decrypted_secret from vault.decrypted_secrets where name = 'pm_cle_visiteurs' limit 1);
begin
  -- Sans clé, pas de plafond possible : on préfère ne rien créer.
  if cle is null then raise exception 'PM: La création est fermée pour le moment. Écrivez-nous.'; end if;
  return encode(extensions.hmac('visiteur:' || left(coalesce(nullif(ip, ''), 'inconnue'), 64), cle, 'sha256'), 'hex');
end $$;

-- +1 pour ce visiteur aujourd'hui. Au-delà du plafond : refus, et le +1 s'annule avec le reste de la transaction.
create or replace function public.pm_plafond_visiteur(p_action text, p_par_jour integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_n integer;
begin
  insert into public.visiteurs as v (empreinte, action, jour, n)
  values (public.pm_empreinte_visiteur(), p_action, (now() at time zone 'Indian/Reunion')::date, 1)
  on conflict (empreinte, action, jour) do update set n = v.n + 1
  returning v.n into v_n;
  if v_n > p_par_jour then
    raise exception 'PM: Vous avez déjà créé plusieurs applis aujourd''hui. Réessayez demain, ou écrivez-nous.';
  end if;
end $$;

-- Le dernier filet : 200 créations par heure pour tout le site, comptées dans UN compteur par heure.
-- Relecture Codex du 08/11/2026, deux défauts rejoués sur le banc : l'ancien comptage (les applis créées depuis une
-- heure) laissait passer deux demandes simultanées (201) et rendait une place quand une appli était effacée.
-- Ici, la ligne de l'heure est verrouillée le temps de la création : les demandes simultanées passent l'une après
-- l'autre, et une appli effacée ne rend pas sa place. Aucune donnée personnelle : un nombre par heure.
create table if not exists public.creations_par_heure (
  heure timestamptz primary key,
  n     integer not null default 0
);
alter table public.creations_par_heure enable row level security;
revoke all on public.creations_par_heure from anon, authenticated;

create or replace function public.pm_plafond_global(p_par_heure integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_n integer;
begin
  insert into public.creations_par_heure as c (heure, n) values (date_trunc('hour', now()), 1)
  on conflict (heure) do update set n = c.n + 1
  returning c.n into v_n;
  if v_n > p_par_heure then
    raise exception 'PM: Trop de créations en ce moment. Réessayez dans une heure.';
  end if;
end $$;

-- Chaque heure, on efface les empreintes des jours passés : aucune ne vit plus de 48 h, même si un passage échoue
-- (relecture Codex du 08/11/2026 : avec un seul passage par nuit, une panne repoussait l'effacement à 51 h).
-- Les compteurs horaires de plus de deux jours partent aussi.
create or replace function public.visiteurs_purger()
returns integer language sql security definer set search_path = '' as $$
  with x as (delete from public.visiteurs where jour < (now() at time zone 'Indian/Reunion')::date returning 1),
       y as (delete from public.creations_par_heure where heure < now() - interval '2 days' returning 1)
  select count(*)::int from x
$$;

-- ---------- Les mariés ----------
create or replace function public.mariage_creer(p_contenu jsonb)
returns json language plpgsql security definer set search_path = '' as $$
declare
  d date := public.pm_verifier(p_contenu);
  base text;
  v_slug text;
  v_code text := public.pm_hasard(6, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789');
  v_cle  text := public.pm_hasard(24, 'abcdefghjkmnpqrstuvwxyz23456789');
begin
  -- Garde-fou contre un remplissage automatique : pas plus de 200 créations par heure, pour tout le site.
  perform public.pm_plafond_global(200);
  -- Et 10 créations par jour au plus pour un même visiteur (un couple en crée une, un organisateur quelques-unes).
  perform public.pm_plafond_visiteur('creer_mariage', 10);
  base := lower(coalesce(p_contenu->'prenoms'->>0, '') || '-' || coalesce(p_contenu->'prenoms'->>1, ''));
  base := translate(base, 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿœæ', 'aaaaaaceeeeiiiinooooouuuuyyoa');
  base := trim(both '-' from regexp_replace(base, '[^a-z0-9]+', '-', 'g'));
  base := left(coalesce(nullif(base, ''), 'mariage'), 40);
  loop
    v_slug := base || '-' || public.pm_hasard(6, 'abcdefghjkmnpqrstuvwxyz23456789');
    exit when not exists (select 1 from public.mariages where slug = v_slug);
  end loop;
  insert into public.mariages (slug, code, cle_hash, contenu, date_mariage)
  values (v_slug, v_code, public.pm_hash(v_cle), p_contenu, d);
  return json_build_object('slug', v_slug, 'code', v_code, 'cle', v_cle);
end $$;

-- Pour les invités : le contenu, seulement avec le bon code, et jamais après les 90 jours.
create or replace function public.mariage_lire(p_slug text, p_code text)
returns json language sql volatile security definer set search_path = '' as $$
  update public.mariages set lu_le = now()
  where slug = p_slug and code = upper(coalesce(p_code, ''))
    and date_mariage + 90 >= (now() at time zone 'Indian/Reunion')::date
  returning json_build_object('contenu', contenu, 'annonce', coalesce(annonce, ''), 'annonce_le', annonce_le)
$$;

create or replace function public.mariage_ouvrir(p_slug text, p_cle text)
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object('contenu', contenu, 'code', code, 'annonce', coalesce(annonce, ''), 'version', modifie_le::text)
  from public.mariages
  where slug = p_slug and cle_hash = public.pm_hash(p_cle)
    and date_mariage + 90 >= (now() at time zone 'Indian/Reunion')::date
$$;

-- p_version : la version ouverte par les mariés. Si quelqu'un a enregistré entre-temps, on refuse au lieu d'écraser.
create or replace function public.mariage_modifier(p_slug text, p_cle text, p_contenu jsonb, p_version text)
returns text language plpgsql security definer set search_path = '' as $$
declare m record; d date; v text;
begin
  select * into m from public.mariages where slug = p_slug and cle_hash = public.pm_hash(p_cle) for update;
  if not found then raise exception 'PM: Lien de modification inconnu.'; end if;
  if m.modifie_le::text is distinct from p_version then
    raise exception 'PM: Une autre modification a été enregistrée entre-temps (sur un autre téléphone ?). Rechargez la page avant d''enregistrer.';
  end if;
  d := public.pm_verifier(p_contenu, m.date_mariage);
  update public.mariages set contenu = p_contenu, date_mariage = d, modifie_le = clock_timestamp()
  where slug = p_slug returning modifie_le::text into v;
  return v;
end $$;

-- Nouveau code pour les invités (si le faire-part a circulé trop loin). L'ancien code ne marche plus.
create or replace function public.mariage_nouveau_code(p_slug text, p_cle text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_code text := public.pm_hasard(6, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789');
begin
  update public.mariages set code = v_code where slug = p_slug and cle_hash = public.pm_hash(p_cle);
  if not found then raise exception 'PM: Lien de modification inconnu.'; end if;
  return v_code;
end $$;

create or replace function public.mariage_annoncer(p_slug text, p_cle text, p_texte text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare t text := nullif(left(trim(coalesce(p_texte, '')), 280), '');
begin
  update public.mariages set annonce = t, annonce_le = case when t is null then null else now() end
  where slug = p_slug and cle_hash = public.pm_hash(p_cle);
  if not found then raise exception 'PM: Lien de modification inconnu.'; end if;
  return true;
end $$;

create or replace function public.mariage_supprimer(p_slug text, p_cle text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  delete from public.mariages where slug = p_slug and cle_hash = public.pm_hash(p_cle);
  if not found then raise exception 'PM: Lien de modification inconnu.'; end if;
  return true;
end $$;

-- Effacement automatique, 90 jours après le mariage.
create or replace function public.mariages_purger()
returns integer language sql security definer set search_path = '' as $$
  with x as (
    delete from public.mariages
    where date_mariage + 90 < (now() at time zone 'Indian/Reunion')::date
    returning 1
  ) select count(*)::int from x
$$;

-- Quand un mariage quitte la base (effacement à 90 jours, ou par les mariés), on garde +1 pour chaque stand signé
-- qu'il citait. Seulement si la fête a eu lieu et qu'un invité a ouvert l'appli : un mariage annulé ou jamais
-- ouvert ne compte pas. Un stand cité deux fois dans le même mariage compte une fois.
create or replace function public.pm_garder_citations()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.lu_le is not null and old.date_mariage <= (now() at time zone 'Indian/Reunion')::date then
    insert into public.mariages_cites (slug, annee, n)
    select distinct e.slug, extract(year from old.date_mariage)::int, 1
    from jsonb_array_elements(case when jsonb_typeof(old.contenu->'prestataires') = 'array' then old.contenu->'prestataires' else '[]'::jsonb end) x
    join public.exposants e on e.slug = x->>'slug'
    on conflict (slug, annee) do update set n = public.mariages_cites.n + 1;
  end if;
  return old;
end $$;

drop trigger if exists pm_garder_citations on public.mariages;
create trigger pm_garder_citations after delete on public.mariages
  for each row execute function public.pm_garder_citations();

-- ---------- Les exposants ----------
-- +1 au total du jour. Ne compte que les stands enregistrés (signés) : rien pour les fiches d'exemple.
create or replace function public.compter(p_slug text, p_type text)
returns void language sql volatile security definer set search_path = '' as $$
  insert into public.compteurs (slug, type, jour, n)
  select p_slug, p_type, (now() at time zone 'Indian/Reunion')::date, 1
  where p_type in ('vue', 'contact', 'depuis_mariage')
    and exists (select 1 from public.exposants where slug = p_slug)
  on conflict (slug, type, jour) do update set n = public.compteurs.n + 1
    where public.compteurs.n < 2000   -- plafond par jour : une boucle ne peut pas gonfler les chiffres sans limite
$$;

create or replace function public.exposant_chiffres(p_slug text, p_cle text)
returns json language plpgsql stable security definer set search_path = '' as $$
declare
  aujourdhui date := (now() at time zone 'Indian/Reunion')::date;
  ex record;
begin
  select * into ex from public.exposants where slug = p_slug and cle_hash = public.pm_hash(p_cle);
  if not found then return null; end if;
  return json_build_object(
    'depuis', ex.cree_le,
    'totaux', (select json_build_object(
        'vue', coalesce(sum(n) filter (where type = 'vue'), 0),
        'contact', coalesce(sum(n) filter (where type = 'contact'), 0),
        'depuis_mariage', coalesce(sum(n) filter (where type = 'depuis_mariage'), 0))
      from public.compteurs where slug = p_slug),
    'mois', (select json_build_object(
        'vue', coalesce(sum(n) filter (where type = 'vue'), 0),
        'contact', coalesce(sum(n) filter (where type = 'contact'), 0),
        'depuis_mariage', coalesce(sum(n) filter (where type = 'depuis_mariage'), 0))
      from public.compteurs where slug = p_slug and jour > aujourdhui - 30),
    -- Les mariages qui citent le stand : ceux encore en ligne (ouverts par un invité), plus ceux déjà effacés.
    'mariages', (select count(*) from public.mariages
      where lu_le is not null
        and contenu->'prestataires' @> jsonb_build_array(jsonb_build_object('slug', p_slug)))
      + (select coalesce(sum(n), 0) from public.mariages_cites where slug = p_slug),
    'mariages_par_annee', (select coalesce(json_object_agg(annee, n order by annee), '{}'::json) from (
        select annee, sum(n)::int as n from (
          select extract(year from date_mariage)::int as annee, 1 as n from public.mariages
          where lu_le is not null
            and contenu->'prestataires' @> jsonb_build_array(jsonb_build_object('slug', p_slug))
          union all
          select annee, n from public.mariages_cites where slug = p_slug) u
        group by annee) a),
    'jours', (select coalesce(json_agg(j order by j.jour), '[]'::json) from (
        select g::date as jour,
          coalesce(sum(c.n) filter (where c.type = 'vue'), 0) as vue,
          coalesce(sum(c.n) filter (where c.type = 'contact'), 0) as contact,
          coalesce(sum(c.n) filter (where c.type = 'depuis_mariage'), 0) as depuis_mariage
        from generate_series(aujourdhui - 29, aujourdhui, interval '1 day') g
        left join public.compteurs c on c.slug = p_slug and c.jour = g::date
        group by g) j)
  );
end $$;

-- Réservé à PIX-I-ART (jamais au public) : enregistre un exposant signé et rend sa clé, une seule fois.
create or replace function public.exposant_creer(p_slug text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_cle text := public.pm_hasard(20, 'abcdefghjkmnpqrstuvwxyz23456789');
begin
  insert into public.exposants (slug, cle_hash) values (p_slug, public.pm_hash(v_cle))
  on conflict (slug) do update set cle_hash = excluded.cle_hash;
  return v_cle;
end $$;

-- ---------- Qui peut appeler quoi ----------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.mariage_creer(jsonb),
  public.mariage_lire(text, text),
  public.mariage_ouvrir(text, text),
  public.mariage_modifier(text, text, jsonb, text),
  public.mariage_nouveau_code(text, text),
  public.mariage_annoncer(text, text, text),
  public.mariage_supprimer(text, text),
  public.compter(text, text),
  public.exposant_chiffres(text, text)
to anon;
-- Les fonctions appelées par celles-ci tournent avec les droits du propriétaire : rien d'autre à ouvrir.

-- ---------- Le ménage de chaque nuit (23 h 17 UTC = 3 h 17 à La Réunion) ----------
select cron.schedule('pm-purge-mariages', '17 23 * * *', 'select public.mariages_purger()');
-- Les empreintes des visiteurs (plafond anti-robots) : chaque heure, à la 27e minute, pour tenir les 48 h promises.
select cron.schedule('pm-purge-visiteurs', '27 * * * *', 'select public.visiteurs_purger()');

-- ---------- Ce qui sera ajouté plus tard reste fermé par défaut ----------
-- (le droit EXECUTE donné à tout le monde est un réglage global de Postgres : on le retire globalement, puis schéma par schéma pour les rôles de Supabase)
alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;

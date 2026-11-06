-- ============================================================
-- Pixie Mariage — base de l'appli du mariage et des chiffres des stands
-- Projet Supabase dédié (jamais celui de Bob / du CASE).
-- Principe : AUCUN accès direct aux tables pour le public. Tout passe par des
-- fonctions qui vérifient le code (invités) ou la clé (mariés, exposants).
-- Pour tout défaire : supabase/rollback.sql
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Les tables ----------
create table if not exists public.mariages (
  slug         text primary key check (slug ~ '^[a-z0-9-]{1,80}$'),
  code         text not null check (code ~ '^[A-Z0-9]{6}$'),
  cle_hash     bytea not null,
  contenu      jsonb not null,
  date_mariage date not null,
  annonce      text check (char_length(annonce) <= 280),
  annonce_le   timestamptz,
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

alter table public.mariages  enable row level security;
alter table public.exposants enable row level security;
alter table public.compteurs enable row level security;
-- Aucune règle d'accès (policy) : sans fonction, personne ne lit ni n'écrit.
revoke all on public.mariages, public.exposants, public.compteurs from anon, authenticated;

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
create or replace function public.pm_verifier(p_contenu jsonb)
returns date language plpgsql set search_path = '' as $$
declare d date;
begin
  if p_contenu is null or jsonb_typeof(p_contenu) <> 'object' then raise exception 'PM: Contenu illisible.'; end if;
  if octet_length(p_contenu::text) > 16000 then raise exception 'PM: Trop de texte : raccourcissez un peu.'; end if;
  if coalesce(trim(p_contenu->'prenoms'->>0), '') = '' or coalesce(trim(p_contenu->'prenoms'->>1), '') = '' then
    raise exception 'PM: Il manque les deux prénoms.';
  end if;
  begin
    d := (p_contenu->>'date')::date;
  exception when others then
    raise exception 'PM: La date du mariage est illisible.';
  end;
  if d is null then raise exception 'PM: Il manque la date du mariage.'; end if;
  if d < (now() at time zone 'Indian/Reunion')::date - 1 or d > (now() at time zone 'Indian/Reunion')::date + 1100 then
    raise exception 'PM: La date doit être dans les trois prochaines années.';
  end if;
  return d;
end $$;

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
  if (select count(*) from public.mariages where cree_le > now() - interval '1 hour') >= 200 then
    raise exception 'PM: Trop de créations en ce moment. Réessayez dans une heure.';
  end if;
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
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object('contenu', contenu, 'annonce', coalesce(annonce, ''), 'annonce_le', annonce_le)
  from public.mariages
  where slug = p_slug and code = upper(coalesce(p_code, ''))
    and date_mariage + 90 >= (now() at time zone 'Indian/Reunion')::date
$$;

create or replace function public.mariage_ouvrir(p_slug text, p_cle text)
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object('contenu', contenu, 'code', code, 'annonce', coalesce(annonce, ''))
  from public.mariages
  where slug = p_slug and cle_hash = public.pm_hash(p_cle)
$$;

create or replace function public.mariage_modifier(p_slug text, p_cle text, p_contenu jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare d date := public.pm_verifier(p_contenu);
begin
  update public.mariages set contenu = p_contenu, date_mariage = d, modifie_le = now()
  where slug = p_slug and cle_hash = public.pm_hash(p_cle);
  if not found then raise exception 'PM: Lien de modification inconnu.'; end if;
  return true;
end $$;

create or replace function public.mariage_annoncer(p_slug text, p_cle text, p_texte text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare t text := nullif(left(trim(coalesce(p_texte, '')), 280), '');
begin
  update public.mariages set annonce = t, annonce_le = case when t is null then null else now() end, modifie_le = now()
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

-- ---------- Les exposants ----------
-- +1 au total du jour. Ne compte que les stands enregistrés (signés) : rien pour les fiches d'exemple.
create or replace function public.compter(p_slug text, p_type text)
returns void language sql volatile security definer set search_path = '' as $$
  insert into public.compteurs (slug, type, jour, n)
  select p_slug, p_type, (now() at time zone 'Indian/Reunion')::date, 1
  where p_type in ('vue', 'contact', 'depuis_mariage')
    and exists (select 1 from public.exposants where slug = p_slug)
  on conflict (slug, type, jour) do update set n = public.compteurs.n + 1
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
    'mariages', (select count(*) from public.mariages
      where contenu->'prestataires' @> jsonb_build_array(jsonb_build_object('slug', p_slug))),
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
  public.mariage_modifier(text, text, jsonb),
  public.mariage_annoncer(text, text, text),
  public.mariage_supprimer(text, text),
  public.compter(text, text),
  public.exposant_chiffres(text, text)
to anon;
-- Les fonctions appelées par celles-ci tournent avec les droits du propriétaire : rien d'autre à ouvrir.

-- ---------- Le ménage de chaque nuit (si pg_cron est activé dans le projet) ----------
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('pm-purge-mariages', '17 23 * * *', 'select public.mariages_purger()');
  end if;
end $$;

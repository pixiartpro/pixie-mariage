-- Défait entièrement supabase/schema.sql (efface les mariages et les chiffres : à n'utiliser qu'en connaissance de cause).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('pm-purge-mariages');
  end if;
exception when others then null;
end $$;

drop trigger if exists pm_garder_citations on public.mariages;
drop function if exists public.pm_garder_citations();
drop function if exists public.mariage_creer(jsonb);
drop function if exists public.mariage_lire(text, text);
drop function if exists public.mariage_ouvrir(text, text);
drop function if exists public.mariage_modifier(text, text, jsonb, text);
drop function if exists public.mariage_nouveau_code(text, text);
drop function if exists public.mariage_annoncer(text, text, text);
drop function if exists public.mariage_supprimer(text, text);
drop function if exists public.mariages_purger();
drop function if exists public.compter(text, text);
drop function if exists public.exposant_chiffres(text, text);
drop function if exists public.exposant_creer(text);
drop function if exists public.pm_verifier(jsonb, date);
drop function if exists public.pm_hash(text);
drop function if exists public.pm_hasard(int, text);
drop table if exists public.mariages_cites;
drop table if exists public.compteurs;
drop table if exists public.exposants;
drop table if exists public.mariages;

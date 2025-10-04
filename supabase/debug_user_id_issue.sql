-- Diagnostics for "column user_id does not exist"
-- Safe to run multiple times. No destructive operations are executed until the FIX section (commented out).

\echo '== 1. Tables missing user_id but referenced in policies =='
select c.relname as table,
       exists(
         select 1 from pg_policies p where p.schemaname='public' and p.tablename = c.relname and (coalesce(p.qual,'') ~~ '%user_id%' or coalesce(p.with_check,'') ~~ '%user_id%')
       ) as policy_mentions_user_id,
       exists(
         select 1 from information_schema.columns col where col.table_schema='public' and col.table_name=c.relname and col.column_name='user_id'
       ) as has_user_id_column
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public'
  and c.relkind='r'
order by 1;

\echo '== 2. Policies that mention user_id but table lacks column =='
with policies as (
  select p.policyname, p.tablename, p.qual, p.with_check
  from pg_policies p
  where p.schemaname='public'
)
select *
from policies pol
where (coalesce(pol.qual,'') ~~ '%user_id%' or coalesce(pol.with_check,'') ~~ '%user_id%')
  and not exists (
    select 1 from information_schema.columns col
    where col.table_schema='public'
      and col.table_name = pol.tablename
      and col.column_name='user_id'
  );

\echo '== 3. Columns for key legacy tables (profiles, user_profiles) =='
select table_name, string_agg(column_name, ', ' order by column_name) as columns
from information_schema.columns
where table_schema='public'
  and table_name in ('profiles','user_profiles')
group by table_name
order by table_name;

\echo '== 4. Functions referencing user_id (text search) =='
select proname,
       pg_get_functiondef(p.oid) like '%user_id%' as mentions_user_id
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
order by 1;

-- == 5. (Optional) Uncomment to auto-create missing user_id on profiles/user_profiles ==
-- DO $$
-- BEGIN
--   IF to_regclass('public.profiles') IS NOT NULL AND NOT EXISTS (
--     SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id'
--   ) THEN
--     ALTER TABLE public.profiles ADD COLUMN user_id uuid; 
--     UPDATE public.profiles SET user_id = id WHERE id IS NOT NULL AND user_id IS NULL; 
--   END IF;
--   IF to_regclass('public.user_profiles') IS NOT NULL AND NOT EXISTS (
--     SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='user_id'
--   ) THEN
--     ALTER TABLE public.user_profiles ADD COLUMN user_id uuid; 
--     UPDATE public.user_profiles SET user_id = id WHERE id IS NOT NULL AND user_id IS NULL; 
--   END IF;
-- END $$;

-- == 6. (Optional) After creating columns, recreate failing policies (example) ==
-- DROP POLICY IF EXISTS "profiles select own" ON public.profiles;
-- CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
-- DROP POLICY IF EXISTS "profiles upsert own" ON public.profiles;
-- CREATE POLICY "profiles upsert own" ON public.profiles FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

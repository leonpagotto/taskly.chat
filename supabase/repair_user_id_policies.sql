-- repair_user_id_policies.sql
-- Purpose: Automatically fix 42703 errors where policies/functions reference user_id on tables lacking it.
-- Safe & idempotent. Run in SQL Editor or psql. Review before executing in production.

BEGIN;

-- 1. Ensure user_id exists & backfilled on key legacy tables
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN user_id uuid;
    END IF;
    UPDATE public.profiles SET user_id = id WHERE user_id IS NULL AND id IS NOT NULL;
  END IF;

  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles' AND column_name='user_id'
    ) THEN
      ALTER TABLE public.user_profiles ADD COLUMN user_id uuid;
    END IF;
    UPDATE public.user_profiles SET user_id = id WHERE user_id IS NULL AND id IS NOT NULL;
  END IF;
END $$;

-- 2. (Optional) Enforce NOT NULL if clean
DO $$
DECLARE v_nulls int;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    SELECT count(*) INTO v_nulls FROM public.profiles WHERE user_id IS NULL;
    IF v_nulls = 0 THEN
      BEGIN
        ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
      EXCEPTION WHEN others THEN NULL; END;
    END IF;
  END IF;
  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    SELECT count(*) INTO v_nulls FROM public.user_profiles WHERE user_id IS NULL;
    IF v_nulls = 0 THEN
      BEGIN
        ALTER TABLE public.user_profiles ALTER COLUMN user_id SET NOT NULL;
      EXCEPTION WHEN others THEN NULL; END;
    END IF;
  END IF;
END $$;

-- 3. Recreate policies that depend on user_id for these tables (safe drop/create)
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "profiles select own" ON public.profiles';
    EXECUTE 'CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = user_id)';
    EXECUTE 'DROP POLICY IF EXISTS "profiles upsert own" ON public.profiles';
    EXECUTE 'CREATE POLICY "profiles upsert own" ON public.profiles FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)';
  END IF;

  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "user_profiles select own" ON public.user_profiles';
    EXECUTE 'CREATE POLICY "user_profiles select own" ON public.user_profiles FOR SELECT TO authenticated USING ((select auth.uid()) = user_id)';
    EXECUTE 'DROP POLICY IF EXISTS "user_profiles upsert own" ON public.user_profiles';
    EXECUTE 'CREATE POLICY "user_profiles upsert own" ON public.user_profiles FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)';
  END IF;
END $$;

-- 4. Integrity guard: fail if any policy still references user_id on a table lacking it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname='public'
      AND (coalesce(p.qual,'') ~~ '%user_id%' OR coalesce(p.with_check,'') ~~ '%user_id%')
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema='public'
          AND c.table_name=p.tablename
          AND c.column_name='user_id'
      )
  ) THEN
    RAISE EXCEPTION 'Integrity check failed: some policies reference user_id on tables without that column.';
  END IF;
END $$;

COMMIT;

-- Verification query (run separately after commit):
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname='public' AND (coalesce(qual,'') ~~ '%user_id%' OR coalesce(with_check,'') ~~ '%user_id%');

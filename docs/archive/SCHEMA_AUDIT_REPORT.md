# 🔍 Schema Audit Report - Critical Issues Found

**Date:** October 3, 2025  
**Schema:** `/Users/leo.de.souza1/taskly.chat/supabase/schema.sql`  
**Status:** ⚠️ **8 Issues Identified** (3 Critical, 3 High, 2 Medium)

---

## 🚨 Critical Issues (Must Fix)

### 1. ⚠️ **app_state Policies Missing "TO authenticated"**
**Severity:** CRITICAL  
**Lines:** 13, 18, 23  
**Risk:** Policies allow PUBLIC access (anonymous users)

**Problem:**
```sql
create policy "app_state select own" on public.app_state
  for select using ((select auth.uid()) = user_id);
```

The policies don't specify `TO authenticated`, which means they apply to ALL roles including `anon` and `public`. While `auth.uid()` returns NULL for anonymous users (causing the check to fail), this is implicit security rather than explicit.

**Impact:**
- Anonymous users could potentially trigger policy evaluation
- Performance overhead on unauthenticated requests
- Less clear security posture

**Fix:**
```sql
create policy "app_state select own" on public.app_state
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "app_state insert own" on public.app_state
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "app_state update own" on public.app_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
```

---

### 2. ⚠️ **project_users.user_id Policy Missing "TO authenticated"**
**Severity:** CRITICAL  
**Line:** 852  
**Risk:** Anonymous users can query project invites

**Problem:**
```sql
create policy "project_users select accessible" on public.project_users
  for select using (
    (select auth.uid())::text = user_id
    or ...
  );
```

Missing `TO authenticated` clause.

**Impact:**
- Anonymous users might be able to see project invite records
- Potential information disclosure about project structure

**Fix:**
```sql
create policy "project_users select accessible" on public.project_users
  for select to authenticated using (
    (select auth.uid())::text = user_id
    or ...
  );
```

---

### 3. ⚠️ **project_invites Policies Missing "TO authenticated"**
**Severity:** CRITICAL  
**Lines:** 942, 956, 970, 984  
**Risk:** Anonymous access to invitation system

**Problem:**
All four policies on `project_invites` are missing `TO authenticated`:
- `project_invites select owner or admin`
- `project_invites insert owner or admin`
- `project_invites update owner or admin`
- `project_invites delete owner or admin`

**Impact:**
- Anonymous users could potentially see/manipulate invite tokens
- Security risk for invitation system
- Could expose project membership information

**Fix:** Add `TO authenticated` to all policies:
```sql
create policy "project_invites select owner or admin" on public.project_invites
  for select to authenticated using (...);

create policy "project_invites insert owner or admin" on public.project_invites
  for insert to authenticated with check (...);

create policy "project_invites update owner or admin" on public.project_invites
  for update to authenticated using (...) with check (...);

create policy "project_invites delete owner or admin" on public.project_invites
  for delete to authenticated using (...);
```

---

## 🔴 High Priority Issues

### 4. ⚠️ **Profiles Migration: No Deduplication Logic**
**Severity:** HIGH  
**Lines:** 218-236  
**Risk:** Unique constraint violation on deployment

**Problem:**
The `profiles` compatibility block backfills `user_id` from `id` and vice versa:
```sql
execute 'update public.profiles set user_id = id where user_id is null';
execute 'update public.profiles set id = user_id where id is null';
```

Then it tries to create a unique constraint:
```sql
alter table public.profiles add constraint profiles_user_id_key unique (user_id);
```

If duplicate `id` or `user_id` values exist, this will fail.

**Impact:**
- Schema deployment could fail with `unique constraint violation`
- Requires manual intervention to fix duplicates

**Fix:** Add deduplication check before constraint creation:
```sql
-- Check for duplicates and fail early with helpful message
do $$
declare
  v_dup_count int;
begin
  select count(*) into v_dup_count
  from (
    select user_id
    from public.profiles
    where user_id is not null
    group by user_id
    having count(*) > 1
  ) dups;

  if v_dup_count > 0 then
    raise exception 'Found % duplicate user_id values in profiles. Run: SELECT user_id, count(*) FROM public.profiles WHERE user_id IS NOT NULL GROUP BY user_id HAVING count(*) > 1;', v_dup_count;
  end if;
end$$;

-- Now safe to create unique constraint
alter table public.profiles add constraint profiles_user_id_key unique (user_id);
```

---

### 5. ⚠️ **user_profiles Migration: Same Deduplication Issue**
**Severity:** HIGH  
**Lines:** 342-419  
**Risk:** Unique constraint violation

**Problem:** Same issue as profiles table - backfills `id`/`user_id` without checking for duplicates first.

**Fix:** Same pattern as above - add duplicate check before creating `user_profiles_user_id_unique`.

---

### 6. ⚠️ **projects Table: RLS Not Guaranteed**
**Severity:** HIGH  
**Line:** 547  
**Risk:** Database state mismatch

**Problem:**
```sql
alter table public.projects enable row level security;
```

External analysis reports `projects.rls_enabled=false` in your live database, despite this line existing in the schema.

**Possible Causes:**
1. Schema was run but later RLS was disabled manually
2. Schema execution failed at this point
3. Migration order issue (if running multiple times)

**Impact:**
- All users can read/write ALL projects (bypasses RLS policies entirely)
- **CRITICAL SECURITY VULNERABILITY** if RLS is actually disabled

**Fix:**
1. Immediately verify RLS status:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'projects';
   ```

2. If false, manually enable:
   ```sql
   ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
   ```

3. Add validation after enabling RLS in schema:
   ```sql
   alter table public.projects enable row level security;

   -- Validate it worked
   do $$
   begin
     if not (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'projects') then
       raise exception 'Failed to enable RLS on public.projects';
     end if;
   end$$;
   ```

---

## ⚠️ Medium Priority Issues

### 7. ⚠️ **project_users.user_id: No Validation for Mixed Types**
**Severity:** MEDIUM  
**Lines:** 829-851  
**Risk:** Data integrity and query bugs

**Problem:**
`project_users.user_id` is `text` to support both:
- UUID values (as text) for registered users: `'550e8400-e29b-41d4-a716-446655440000'`
- Email addresses for pending invites: `'user@example.com'`

But there's no validation or normalization:
- No CHECK constraint to ensure it's either valid UUID text or valid email
- No normalization (lowercase, trim) for emails
- Comparisons like `v_uid::text = user_id` will fail if extra whitespace exists

**Impact:**
- Duplicate invites with different email casing: `User@Example.com` vs `user@example.com`
- Failed access checks if UUID text has unexpected formatting
- Hard to audit which records are UUIDs vs emails

**Fix:** Add validation and normalization:

```sql
-- 1. Add CHECK constraint
alter table public.project_users add constraint project_users_user_id_format 
  check (
    user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'  -- UUID
    or user_id ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'  -- Email
  );

-- 2. Add normalization trigger
create or replace function normalize_project_users_user_id()
returns trigger
language plpgsql
as $$
begin
  -- If it's an email, normalize to lowercase
  if new.user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    new.user_id := lower(trim(new.user_id));
  end if;
  return new;
end;
$$;

drop trigger if exists project_users_normalize_user_id on public.project_users;
create trigger project_users_normalize_user_id
  before insert or update on public.project_users
  for each row
  execute function normalize_project_users_user_id();

-- 3. Normalize existing data
update public.project_users
set user_id = lower(trim(user_id))
where user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
```

**Alternative:** Add separate columns:
```sql
-- Better design: separate columns for clarity
alter table public.project_users add column user_uuid uuid references auth.users(id);
alter table public.project_users add column invite_email text;
alter table public.project_users add constraint project_users_user_xor_email 
  check ((user_uuid is not null and invite_email is null) or (user_uuid is null and invite_email is not null));
```

---

### 8. ⚠️ **upsert_checklist_bundle: SECURITY DEFINER Privilege Escalation Risk**
**Severity:** MEDIUM  
**Lines:** 1659-1721  
**Risk:** If function owner is superuser, RLS could be bypassed

**Problem:**
Function is `SECURITY DEFINER`:
```sql
create or replace function public.upsert_checklist_bundle(...)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
```

If the function owner (likely `postgres` superuser) has RLS bypass privileges, this function could inadvertently allow users to modify other users' data despite the ownership checks.

**Current Mitigation (Good):**
- Function checks `v_user := (select auth.uid())`
- Validates ownership after upsert: `where c.user_id = v_user`
- Explicit check: `if not exists (select 1 from public.checklists where id = v_id and user_id = v_user)`

**Impact:**
- Low risk due to explicit checks, but potential edge cases
- If function owner changes, behavior could change
- Hard to audit privilege escalation

**Recommendation:**
1. **Keep current design** (it's reasonably safe) but add comment explaining security model
2. **Alternative:** Change to `SECURITY INVOKER` if RLS policies are sufficient:
   ```sql
   create or replace function public.upsert_checklist_bundle(...)
   returns uuid
   language plpgsql
   security invoker  -- Uses caller's privileges, RLS applies
   set search_path = public
   as $$
   ```
   
   This removes the risk entirely but requires policies to be perfect.

3. **Best Practice:** Create a dedicated role for function ownership (not superuser):
   ```sql
   -- One-time setup
   create role taskly_functions_owner noinherit;
   grant authenticated to taskly_functions_owner;
   
   -- Then set function owner
   alter function public.upsert_checklist_bundle(jsonb, jsonb, text[]) 
     owner to taskly_functions_owner;
   ```

**Add Security Comment:**
```sql
create or replace function public.upsert_checklist_bundle(...)
returns uuid
language plpgsql
security definer  -- Required to bypass RLS for atomic multi-table updates
set search_path = public
as $$
-- SECURITY MODEL:
-- 1. Uses SECURITY DEFINER to perform atomic operations across tables
-- 2. Validates caller identity via auth.uid()
-- 3. Enforces ownership on ALL operations (insert/update/delete)
-- 4. Cannot be used to access or modify another user's data
-- 5. Function owner should be a non-superuser role with minimal privileges
declare
  v_user uuid := (select auth.uid());
  ...
```

---

## ✅ Good Practices Already Implemented

1. ✅ **Helper functions marked STABLE** - Performance optimized (lines 34, 88, 551)
2. ✅ **Trigger functions properly restricted** - No unnecessary grants (lines 1421, 1456)
3. ✅ **get_user_tenants returns uuid[]** - Type-safe (line 551)
4. ✅ **Explicit REVOKE/GRANT on functions** - Follows least privilege (lines 80-82, 144-146, etc.)
5. ✅ **search_path = public** - Prevents schema injection attacks
6. ✅ **Indexes on foreign keys** - Performance optimized
7. ✅ **RLS enabled on most tables** - Security-first design
8. ✅ **Ownership validation in RPC** - Prevents privilege escalation (line 1699)

---

## 📋 Action Plan (Prioritized)

### Immediate (Today)
1. **Verify projects RLS status** - Could be critical security hole
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

2. **Add "TO authenticated" to 7 policies** - app_state (3), project_users (1), project_invites (4)

### High Priority (This Week)
3. **Add deduplication checks** - profiles and user_profiles migrations
4. **Add validation to project_users.user_id** - Prevent bad data

### Medium Priority (Next Sprint)
5. **Audit function ownership** - Ensure upsert_checklist_bundle owner isn't superuser
6. **Document security model** - Add comments to SECURITY DEFINER functions

---

## 🧪 Validation Queries

Run these against your live database to validate current state:

### Check RLS Status
```sql
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check for Tables with RLS but No Policies
```sql
SELECT 
  t.tablename,
  t.rowsecurity,
  count(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p 
  ON p.schemaname = t.schemaname 
  AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.tablename, t.rowsecurity
HAVING count(p.policyname) = 0;
```

### Check project_users for Mixed Types
```sql
-- Find email invites (not UUIDs)
SELECT 
  id,
  project_id,
  user_id,
  email,
  status,
  CASE 
    WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN 'UUID'
    ELSE 'Email'
  END as type
FROM public.project_users
ORDER BY type, created_at DESC;
```

### Check for Duplicate profiles.user_id
```sql
SELECT 
  user_id,
  count(*) as duplicate_count
FROM public.profiles
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING count(*) > 1;
```

### Check Function Ownership
```sql
SELECT 
  p.proname as function_name,
  r.rolname as owner,
  r.rolsuper as is_superuser,
  p.provolatile as volatility,
  p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_roles r ON r.oid = p.proowner
WHERE p.pronamespace = 'public'::regnamespace
  AND p.proname IN (
    'has_project_access',
    'has_project_admin', 
    'get_user_tenants',
    'upsert_checklist_bundle',
    'set_updated_at'
  )
ORDER BY p.proname;
```

---

## 📊 Summary

| Issue | Severity | Risk | Fix Complexity | Priority |
|-------|----------|------|----------------|----------|
| app_state missing TO authenticated | Critical | High | Low | 1 |
| project_users missing TO authenticated | Critical | High | Low | 1 |
| project_invites missing TO authenticated | Critical | High | Low | 1 |
| profiles deduplication | High | Medium | Medium | 2 |
| user_profiles deduplication | High | Medium | Medium | 2 |
| projects RLS disabled | High | Critical | Low | 1 |
| project_users type validation | Medium | Medium | Medium | 3 |
| upsert_checklist_bundle privilege | Medium | Low | Low | 3 |

**Total Issues:** 8 (3 Critical, 3 High, 2 Medium)  
**Estimated Fix Time:** 2-4 hours  
**Testing Required:** Yes (regression testing on RLS policies)

---

## 🔧 Quick Fix Script

Would you like me to generate a migration script that fixes all Critical and High priority issues?

# Schema Issues and Recommended Fixes

## Critical Issues Found

### 1. **Type Mismatch: `text` vs `uuid` for ID columns**

**Problem:** Your schema.sql defines most ID columns as `text`, but based on the analysis, your existing database tables use `uuid`. This creates:
- Foreign key type mismatches
- Implicit casting issues
- Performance degradation
- Potential data corruption

**Affected Tables:**
- `organizations` (id)
- `projects` (id)
- `teams` (id)
- `user_categories` (id)
- `checklists` (id)
- `tasks` (id)
- `habits` (id)
- `habit_tasks` (id)
- `events` (id)
- `notes` (id)
- `project_files` (id)
- `stories` (id)
- `requests` (id)
- `request_updates` (id)
- `conversations` (id)
- `messages` (id)

**Recommendation:** Choose ONE approach:

#### Option A: Standardize on UUID (RECOMMENDED for Supabase)
- ✅ Better performance
- ✅ Native Postgres type
- ✅ Consistent with Supabase best practices
- ✅ Auto-generated IDs via `gen_random_uuid()`

#### Option B: Keep text IDs
- ⚠️ Requires explicit client-side ID generation
- ⚠️ Less efficient indexing
- ⚠️ More casting overhead

### 2. **Function Parameter Type Mismatches**

**Problem:** Your helper functions use `text` parameters but compare against `uuid` columns:

```sql
-- Current (WRONG if projects.id is uuid):
create or replace function public.has_project_access(p_project_id text)

-- Should be (if projects.id is uuid):
create or replace function public.has_project_access(p_project_id uuid)
```

**Affected Functions:**
- `has_project_access(text)` → should be `has_project_access(uuid)`
- `has_project_admin(text)` → should be `has_project_admin(uuid)`

### 3. **Inconsistent `project_users.user_id` Type**

**Problem:** `project_users.user_id` is `text` (to support email-based invites before user signup), but everywhere else `user_id` is `uuid`.

**Current Issue:**
```sql
-- In policies you cast:
(select auth.uid())::text = user_id

-- This works but is confusing and error-prone
```

**Better Design:**
```sql
-- Option 1: Separate columns
user_uuid uuid references auth.users(id),
invited_email text,

-- Option 2: Keep as-is but add clear documentation
user_id text,  -- Can be uuid::text OR email for pending invites
```

### 4. **Missing `TO authenticated` in Some Policies**

**Problem:** Some policies don't specify `TO authenticated`, defaulting to PUBLIC access when RLS is enabled.

**Affected Policies:**
- Several `project_users` policies
- Some `project_invites` policies

While these might still be protected by USING clauses, it's better to be explicit.

## Recommended Action Plan

### Phase 1: Decide on ID Strategy

**RECOMMENDED: Standardize on UUID**

Reasons:
1. Your database already has UUID tables
2. Supabase best practice
3. Better performance
4. Less confusion

### Phase 2: Update Schema DDL

If choosing UUID (recommended), update all table definitions:

```sql
-- Change FROM:
create table if not exists public.projects (
  id text primary key,
  ...
);

-- TO:
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  ...
);
```

### Phase 3: Update Function Signatures

```sql
-- Change FROM:
create or replace function public.has_project_access(p_project_id text)

-- TO:
create or replace function public.has_project_access(p_project_id uuid)
```

### Phase 4: Update Foreign Key References

```sql
-- Change FROM:
project_id text references public.projects(id)

-- TO:
project_id uuid references public.projects(id)
```

### Phase 5: Handle `project_users` Special Case

**Option A: Keep as text (simpler migration)**
```sql
create table public.project_users (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  user_id text,  -- DOCUMENTED: uuid::text OR email string
  email text,
  ...
  constraint project_users_user_or_email check (user_id is not null or email is not null)
);
```

**Option B: Split into separate columns (cleaner)**
```sql
create table public.project_users (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  user_uuid uuid references auth.users(id),  -- Actual user after signup
  invited_email text,  -- Email for pending invites
  ...
  constraint project_users_user_or_email check (user_uuid is not null or invited_email is not null)
);
```

### Phase 6: Add Explicit `TO authenticated`

Add `TO authenticated` to all policies that should only apply to authenticated users:

```sql
-- Change FROM:
create policy "project_users select accessible" on public.project_users
  for select using (...);

-- TO:
create policy "project_users select accessible" on public.project_users
  for select to authenticated using (...);
```

## Migration Scripts

### If Switching to UUID (and database already has UUIDs)

**Step 1: Verify Current Types**
```sql
-- Check what types are actually in the database
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('projects', 'organizations', 'checklists', 'tasks')
  AND column_name = 'id';
```

**Step 2: If DDL doesn't match database, fix references**

Since your DB already has UUID but your DDL says text, you need to ensure foreign key columns also use UUID:

```sql
-- Example: if checklists.project_id is text but should be uuid
ALTER TABLE public.checklists 
  ALTER COLUMN project_id TYPE uuid USING project_id::uuid;
```

**Step 3: Update Function Signatures**
```sql
-- Drop old signatures
DROP FUNCTION IF EXISTS public.has_project_access(text);
DROP FUNCTION IF EXISTS public.has_project_admin(text);

-- Recreate with UUID
-- (use the updated functions from your fixed schema.sql)
```

## Quick Wins (Can do immediately)

1. **Add `TO authenticated` to all policies**
   - Low risk
   - Improves security clarity
   - Already done in previous fixes

2. **Update function parameter types to match database**
   - Changes function signature
   - Update all callers (policies already use the functions correctly)

3. **Add comments for `project_users.user_id`**
   ```sql
   COMMENT ON COLUMN public.project_users.user_id IS 
     'Can be UUID (as text) for registered users or email for pending invites';
   ```

4. **Verify no text→uuid mismatches**
   - Run the query above to check actual column types

## Testing Strategy

1. **Test in development environment first**
2. **Run schema on fresh database** to ensure idempotency
3. **Check all foreign keys resolve correctly**
4. **Verify RLS policies work** with test users
5. **Test helper functions** with actual UUIDs

## Summary

**Highest Priority:**
1. ✅ Align all ID column types (choose UUID)
2. ✅ Update function signatures to match
3. ✅ Verify foreign key type consistency

**Medium Priority:**
4. Clarify `project_users.user_id` design
5. Add `TO authenticated` to remaining policies

**Low Priority:**
6. Add comments for complex columns
7. Consider splitting text/uuid columns in project_users

Would you like me to:
- Generate the complete updated schema.sql with UUID types?
- Create migration scripts for the database?
- Fix just the function signatures first?

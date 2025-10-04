# How to Run the Database Schema

Your schema is ready at `supabase/schema.sql` (1801 lines). Here are the best ways to execute it:

## ✅ Option 1: Supabase Dashboard (RECOMMENDED - Easiest)

1. **Open your Supabase project:**
   - Go to: https://qaemzribxkcvjhldpyto.supabase.co
   - Login if needed

2. **Navigate to SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Or go directly to: https://qaemzribxkcvjhldpyto.supabase.co/project/qaemzribxkcvjhldpyto/sql/new

3. **Paste and execute:**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click **"Run"** (or press Cmd+Enter)

4. **Wait for completion:**
   - The schema creates ~30 tables with RLS policies
   - Should complete in 10-30 seconds

## Option 2: Using psql (If you have direct database access)

```bash
# You'll need your database password from Supabase dashboard
# (Project Settings → Database → Connection string → Password)

psql "postgresql://postgres.qaemzribxkcvjhldpyto:[YOUR_PASSWORD]@db.qaemzribxkcvjhldpyto.supabase.co:5432/postgres" \
  -f supabase/schema.sql
```

## Option 3: Supabase CLI (Requires setup)

```bash
# 1. Start local Supabase (requires Docker)
supabase start

# 2. Apply migrations
supabase db reset

# 3. Push to remote
supabase db push
```

## What the Schema Creates

The schema will set up:

✅ **Core Tables:**
- `app_state` - JSON blob storage per user
- `profiles` - User profiles and preferences
- `user_categories` - Custom categories
- `projects` - Projects with collaboration
- `checklists`, `tasks` - Task management
- `habits` - Habit tracking with completions
- `events` - Calendar events
- `notes` - Rich text notes
- `stories` - Kanban/backlog stories
- `requests` - Request intake system
- `conversations`, `messages` - AI chat history

✅ **Collaboration:**
- `organizations`, `organization_members`
- `project_members`, `project_users`, `project_invites`
- `teams`, `team_members`
- `documents`

✅ **Security:**
- Row Level Security (RLS) enabled on all tables
- Policies restricting access to authenticated users
- Helper functions: `has_project_access()`, `has_project_admin()`

✅ **Functions:**
- `upsert_checklist_bundle()` - Atomic checklist updates
- `get_user_tenants()` - Multi-tenant support
- Trigger functions for `updated_at` timestamps

## After Running

1. **Verify tables were created:**
   - In Supabase Dashboard → Table Editor
   - You should see ~30 tables

2. **Test authentication:**
   - Enable Auth providers in Supabase Dashboard
   - Test sign up/login in your app

3. **Check RLS policies:**
   - In Supabase Dashboard → Authentication → Policies
   - Each table should have 2-4 policies

## Troubleshooting

**Error: "column user_id does not exist"**
- Fixed! The schema now properly sets up `user_profiles` table with RLS

**Error: "syntax error at end of input"**
- Your current schema.sql is complete and correct
- Make sure you're copying the entire file

**Error: "permission denied"**
- You need to be logged in as the project owner
- Use the Supabase Dashboard method (Option 1)

## Need Help?

If you encounter errors:
1. Copy the error message
2. Check which line number (if provided)
3. The schema is idempotent - safe to run multiple times
4. Most `create` statements use `if not exists`

---

**Your project:** qaemzribxkcvjhldpyto
**Region:** aws-0-us-west-1
**Schema file:** `supabase/schema.sql` (1801 lines, production-ready)

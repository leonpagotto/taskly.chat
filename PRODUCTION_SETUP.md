## Production setup

### Enable cloud sync with Supabase

1) Create a project in Supabase and note your Project URL and anon public key.

2) Run the SQL in `supabase/schema.sql` in the SQL editor to create the `app_state` table and RLS policies.

3) Add the following environment variables for your dev and deploy environments (Vite reads these at build/runtime via import.meta.env):

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4) In the app, go to Settings > Account and click Sign in to receive a magic link. After signing in, your data will be stored under your user and kept in sync.

Notes:
- If Supabase vars are missing, the app will continue using localStorage only.
- The current implementation stores the whole app state as a single JSON document per user (`app_state.data`). You can later evolve this to normalized tables as needed.

### Optional: Move to normalized relational schema

1) In Supabase SQL editor, run the full schema in `supabase/schema.sql` (it now includes both the legacy `app_state` table and normalized tables with RLS). For a brand-new project with zero tables, this single script is all you need.
2) Rebuild/redeploy with the same env vars. The app ships with a `services/relationalDatabaseService.ts` you can integrate incrementally.
3) To migrate your current local/app_state data into the new tables, sign in, then call the `migrateToRelational` helper from DevTools:

	 - Open DevTools Console and run:
		 window.__taskly_migrate && window.__taskly_migrate()

	 You can wire this to a temporary Settings button if preferred. The helper reads the in-memory state and upserts to relational tables, preserving your IDs.

Caveats:
- Conversations and messages are stored relationally (with RLS) and mirrored by the app; ensure you ran the full schema.
- For larger files, consider moving to Supabase Storage buckets; the current table stores base64 in `project_files.data` for convenience only.


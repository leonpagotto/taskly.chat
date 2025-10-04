# Troubleshooting Guide

## Error: "Unable to find snippet with ID [uuid]"

### Cause
This error occurs when the application has a reference to data that no longer exists. This can happen due to:
- Corrupted local storage
- Incomplete data deletion
- Stale references from old app versions

### Solution 1: Clear Browser Local Storage (Recommended)

**Development:**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
// Then refresh the page
```

**Or manually:**
1. Open DevTools (F12)
2. Go to Application tab
3. Select "Local Storage" → your domain
4. Right-click → Clear
5. Refresh the page

### Solution 2: Clear Specific Keys

```javascript
// In browser console:
Object.keys(localStorage).forEach(key => {
  if (key.includes('taskly') || key.includes('supabase')) {
    localStorage.removeItem(key);
  }
});
```

### Solution 3: Add Error Boundary to Handle Missing References

If the error persists, the application may need defensive code to handle missing references gracefully.

## Error: "column user_id does not exist"

### Cause
The `user_profiles` table (legacy compatibility table) was missing RLS policies.

### Solution
This was fixed in the schema. Redeploy `supabase/schema.sql` to apply the fix.

## Database Connection Issues

### Check Connection
```bash
# In terminal:
if [ -n "$DATABASE_URL" ] || [ -n "$SUPABASE_DB_URL" ]; then 
  echo "✅ Database connection available"
else 
  echo "⚠️  No database connection - set DATABASE_URL or SUPABASE_DB_URL"
fi
```

### Set Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_REL_DB=true
```

## Data Migration Issues

### Reset and Reimport
```javascript
// In browser console:
await window.__taskly_migrate();
```

## Still Having Issues?

1. Check browser console for full error stack trace
2. Verify Supabase connection in Network tab
3. Check RLS policies are properly configured
4. Ensure you're logged in (auth.uid() must return a value)

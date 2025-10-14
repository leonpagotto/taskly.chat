# Database Type Mismatch Fix - UUID Columns

## Issue Identified

**Error Message:**
```
column "category_id" is of type uuid but expression is of type text
```

**Location:** `relationalDatabaseService.ts` - RPC call `upsert_checklist_bundle`

## Root Cause

PostgreSQL UUID columns require values to be either:
- Valid UUID strings
- SQL `NULL`

However, the app was sending:
- Empty strings `""`
- String literal `"null"`
- String literal `"undefined"`

This caused PostgreSQL to reject the insert/update with a type mismatch error.

## Impact

This bug affected all entities with optional UUID foreign keys:
- ✅ **Checklists**: `category_id`, `project_id`, `source_note_id`, `generated_checklist_id`
- ✅ **Habits**: `category_id`, `project_id`
- ✅ **Events**: `category_id`, `project_id`
- ✅ **Requests**: `project_id`

**Symptoms:**
- Checklists/Habits/Events/Requests would not save to Supabase
- Console errors: `400 (Bad Request)`
- Data only persisted to localStorage, not cloud database
- On page reload, local changes would be lost (if logged in)

## Solution Applied

Created a `cleanUUID` helper function that converts invalid UUID values to `null`:

```typescript
const cleanUUID = (val: any): string | null => {
  if (!val || val === '' || val === 'null' || val === 'undefined') return null;
  return val;
};
```

Applied this function to all UUID fields in:

### 1. Checklists (`upsertChecklist`)
**File:** `services/relationalDatabaseService.ts` (lines ~236-260)

**Fixed Fields:**
- `categoryId` → `category_id`
- `projectId` → `project_id`
- `sourceNoteId` → `source_note_id`
- `generatedChecklistId` → `generated_checklist_id`

**Locations Fixed:**
- RPC call payload (line ~246)
- Fallback manual upsert (line ~279)

### 2. Habits (`upsertHabit`)
**File:** `services/relationalDatabaseService.ts` (lines ~358-375)

**Fixed Fields:**
- `categoryId` → `category_id`
- `projectId` → `project_id`

### 3. Events (`upsertEvent`)
**File:** `services/relationalDatabaseService.ts` (lines ~430-444)

**Fixed Fields:**
- `categoryId` → `category_id`
- `projectId` → `project_id`

### 4. Requests (`upsertRequest`)
**File:** `services/relationalDatabaseService.ts` (lines ~569-601)

**Fixed Fields:**
- `projectId` → `project_id`

**Also Updated:**
- `listRequests()` to include `projectId` in returned data (line ~563)
- `upsertRequest` return value to include `projectId` (line ~623)

## Testing

After this fix:
1. ✅ Create a new checklist without selecting a category → should save successfully
2. ✅ Create a new habit without selecting a project → should save successfully
3. ✅ Edit a checklist and remove its category → should save successfully
4. ✅ Create an event without category/project → should save successfully
5. ✅ Create/edit a request with or without project → should save successfully

**Expected Console Output:**
```
✅ Successfully saved to Supabase
```

**No more errors like:**
```
❌ RPC upsert_checklist_bundle failed: column "category_id" is of type uuid but expression is of type text
```

## Why This Happened

The frontend code uses optional fields:
```typescript
interface Checklist {
  categoryId?: string;
  projectId?: string;
  // ...
}
```

When these fields are `undefined`, JavaScript's `|| null` operator works correctly.

However, when they are:
- Empty string `""` (from form inputs)
- String `"null"` (from serialization)
- String `"undefined"` (from serialization)

The `|| null` operator doesn't catch them because they're truthy values in JavaScript!

## Prevention

The `cleanUUID` helper now ensures all UUID fields are properly sanitized before being sent to PostgreSQL. This handles all edge cases:

```typescript
cleanUUID(undefined)    → null  ✅
cleanUUID(null)         → null  ✅
cleanUUID('')           → null  ✅
cleanUUID('null')       → null  ✅
cleanUUID('undefined')  → null  ✅
cleanUUID('valid-uuid') → 'valid-uuid' ✅
```

## Files Modified

1. **services/relationalDatabaseService.ts**
   - Added `cleanUUID` helper function (4 instances)
   - Fixed `upsertChecklist` (RPC and fallback)
   - Fixed `upsertHabit`
   - Fixed `upsertEvent`
   - Fixed `upsertRequest`
   - Updated `listRequests` to include `projectId`

## Verification Steps

1. Clear browser console
2. Create/edit items with no category or project
3. Watch console - should see successful saves
4. Check Supabase dashboard - data should be in database
5. Refresh page - changes should persist

## Related Issues

This fix resolves:
- ✅ Checklists not persisting to Supabase
- ✅ Habits not persisting to Supabase
- ✅ Events not persisting to Supabase
- ✅ Requests not persisting to Supabase (when project field is involved)
- ✅ 400 Bad Request errors in console
- ✅ Data loss on page reload for logged-in users

---

**Status**: ✅ COMPLETE - All UUID type mismatch issues fixed

# Quick Testing Guide - Persistence & Notes Checkboxes

## 🎯 User Story 1: Test Data Persistence

### Before You Start
- Open browser Developer Tools (F12 or Cmd+Option+I)
- Go to Console tab
- Clear console for clean output

---

### Test 1: Habit Completion ✅

**Steps:**
1. Go to **Habits** page
2. Find a habit and **click the checkbox** for today
3. Watch the console output

**Expected Console Output:**
```
🔄 handleUpdateHabit called: { habitId: "...", updatedData: {...} }
✅ Updated habits state: {...}
💾 Saving to localStorage... { habitsCount: 5, requestsCount: 3 }
✅ Successfully saved to localStorage
🔄 Debounced save triggered - will save to Supabase in 900ms
💾 Saving app state to Supabase... { requestsCount: 3, habitsCount: 5, checklistsCount: 4 }
✅ Successfully saved to Supabase
```

4. **Wait 2 seconds** (let the debounced save complete)
5. **Refresh the page** (Cmd+R or Ctrl+R)
6. **Check**: Habit should still be checked ✅

**If it fails:** Check console for ❌ errors

---

### Test 2: Task Completion ✅

**Steps:**
1. Go to **Checklists** or **Lists** page
2. Find a task and **check it**
3. Watch the console output (similar pattern to habits)
4. **Wait 2 seconds**
5. **Refresh the page**
6. **Check**: Task should still be checked ✅

---

### Test 3: Request Updates ✅ (The Bug We Fixed)

**Steps:**
1. Go to **Requests** page
2. Click on an existing request to **edit it**
3. Change any field:
   - Problem / Request
   - Desired Outcome
   - Value Proposition
   - Affected Users
   - etc.
4. Click **Submit**
5. Watch the console output

**Expected Console Output:**
```
🔄 handleUpdateRequest called: { id: "...", updates: { problem: "New problem text", ... } }
📋 Previous request: { id: "...", problem: "Old problem text", ... }
✅ Updated requests state: { id: "...", problem: "New problem text", ... }
💾 Saving to localStorage... { habitsCount: 5, requestsCount: 3 }
✅ Successfully saved to localStorage
🔄 Debounced save triggered - will save to Supabase in 900ms  <-- THIS IS THE FIX!
💾 Saving app state to Supabase... { requestsCount: 3, habitsCount: 5, checklistsCount: 4 }
✅ Successfully saved to Supabase
```

6. **Wait 2 seconds** (critical!)
7. **Refresh the page**
8. **Check**: Your changes should persist ✅

**⚠️ BEFORE THE FIX:** The "Debounced save triggered" line would NOT appear, so changes only saved to localStorage, not Supabase. On reload (with login), old data from Supabase would overwrite local changes.

**✅ AFTER THE FIX:** Changes now save to both localStorage AND Supabase, persisting correctly.

---

## 🎯 User Story 2: Test Notes Checkboxes

### Test: Checkbox List Functionality ✅

**Steps:**
1. Go to **Notes** page
2. **Create a new note** or open an existing one
3. Look at the toolbar at the top
4. Find the **checklist button** (icon looks like a list with checkboxes)
   - It's between the "Numbered List" and "Code" buttons
5. **Click the checklist button**
6. A checkbox should appear with editable text next to it

**Expected Result:**
```
☐ [Type your text here]
```

7. **Type some text** next to the checkbox
8. **Press Enter** - a new checkbox item should appear
9. **Click the checkbox** to check it
10. Text should get a **strike-through** effect

**Expected Result:**
```
☑ Your text here
☐ [Type another item]
```

11. **Add several items**, check some, leave others unchecked
12. **Close the note** (go back to Notes list)
13. **Reopen the same note**
14. **Check**: All checkbox states should persist ✅

---

### Additional Checkbox Features to Test

**Keyboard Navigation:**
- **Enter**: Creates new checkbox item
- **Backspace** (on empty item): Removes the checkbox item
- **Shift+Enter**: Exits checkbox list (creates normal paragraph)

**Visual Feedback:**
- Hover over checkbox: Should highlight
- Checked items: Should have strike-through text
- Checkbox appearance: Custom gradient style when checked

---

## 🔍 Troubleshooting

### If Habits/Tasks Don't Persist

**Check Console For:**
```
❌ Failed to save to Supabase: [error message]
```

**Common Issues:**
1. **Not logged in** - Check auth status
2. **No internet** - Check network tab (should save to localStorage and sync later)
3. **Supabase error** - Check credentials in .env file

**Fallback Behavior:**
Even if Supabase fails, data should persist in localStorage. You won't lose data, it just won't sync across devices until the connection is restored.

---

### If Requests Don't Persist

**Before the fix:** 
- Console would show localStorage save but NO "Debounced save triggered"
- Data would be lost on page reload (when logged in)

**After the fix:**
- Console should show BOTH localStorage AND Supabase saves
- Data persists across reloads

**Still having issues?**
1. Check if `requests` is in the dependency array (App.tsx line ~1833)
2. Clear browser cache and reload
3. Check Supabase dashboard to see if data is being saved

---

### If Notes Checkboxes Don't Work

**Check These:**
1. **Can you see the checklist button?** 
   - It's in the toolbar with icon PlaylistAddCheck
   - If not visible, might be in "More Tools" (...) menu on mobile
   
2. **Does clicking create a checkbox?**
   - Should insert HTML: `<ul class="note-checkbox-list"><li class="note-checkbox-item">...`
   
3. **Can you check/uncheck?**
   - Checkboxes should be clickable
   - Should trigger `handleContentChange()` in console (if logging enabled)
   
4. **Do states persist?**
   - Close and reopen note
   - Check browser localStorage (Application tab > Local Storage)
   - Look for `notes_v2` key

---

## ✅ Success Criteria Checklist

### User Story 1: Persistence
- [ ] Habit completion persists after refresh
- [ ] Task completion persists after refresh  
- [ ] Request field updates persist after refresh
- [ ] Console shows successful saves to both localStorage and Supabase
- [ ] No ❌ errors in console
- [ ] Works while offline (saves to localStorage, syncs later)

### User Story 2: Notes Checkboxes
- [ ] Checklist button visible in Notes toolbar
- [ ] Clicking button inserts checkbox list
- [ ] Can type text next to checkboxes
- [ ] Enter key creates new checkbox items
- [ ] Clicking checkbox toggles checked state
- [ ] Checked items show strike-through
- [ ] Checkbox states persist after closing/reopening note
- [ ] Backspace removes empty items
- [ ] Works in both desktop and mobile views

---

## 📊 What to Report

If you find any issues, please report:

1. **What you were doing** (which test above)
2. **What you expected** (from "Expected Result" sections)
3. **What actually happened** (describe the behavior)
4. **Console output** (copy/paste relevant logs)
5. **Browser & device** (Chrome/Safari/Firefox, desktop/mobile)
6. **Network status** (online/offline when it happened)

---

## 🎉 If Everything Works

Congratulations! Both user stories are now complete:
- ✅ All data persists correctly (habits, tasks, requests)
- ✅ Notes checkbox lists work perfectly
- ✅ Offline support is functioning
- ✅ Debug logging helps troubleshoot issues

The app is ready for production! 🚀

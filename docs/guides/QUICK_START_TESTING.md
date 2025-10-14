# Quick Start Testing Guide

**Purpose:** Quickly verify both new features are working correctly  
**Time Required:** ~5 minutes  
**Prerequisites:** Development environment running, logged into app

---

## ✅ Quick Test Checklist

### 1. Test Habit Persistence (2 minutes)

**Steps:**
1. Navigate to Habits page
2. Create a new habit (or use existing)
3. Click on today's date to check it
4. Wait 1 second
5. Open browser DevTools → Network tab
6. Look for a request to your database
7. Refresh the page (Cmd/Ctrl + R)
8. Verify the checkmark is still there

**Expected Result:**
- ✅ Checkmark appears instantly when clicked
- ✅ Network request visible in DevTools
- ✅ Checkmark persists after refresh

**If it fails:**
- Check console for errors
- Verify you're logged in
- Check Supabase connection

---

### 2. Test Task Persistence (2 minutes)

**Steps:**
1. Navigate to Tasks page
2. Create a new task list with 3-4 items
3. Check 2-3 tasks rapidly (click, click, click)
4. Wait 1 second
5. Open DevTools → Network tab
6. Look for database save request
7. Refresh the page
8. Verify all checked tasks remain checked

**Expected Result:**
- ✅ Tasks check instantly
- ✅ Single batched network request (not multiple)
- ✅ States persist after refresh

**If it fails:**
- Check console for JavaScript errors
- Verify persistence service is imported
- Check App.tsx handlers

---

### 3. Test Note Checkboxes (1 minute)

**Steps:**
1. Navigate to Notes
2. Create a new note or open existing
3. Find the ☑ Checklist button in toolbar
4. Click it
5. Type "First item" and press Enter
6. Type "Second item" and check the first checkbox
7. Navigate away and back to the note
8. Verify checked state persists

**Expected Result:**
- ✅ Checkbox button visible in toolbar
- ✅ New checkbox items insert correctly
- ✅ Checking applies green gradient + strikethrough
- ✅ States persist after navigation

**If it fails:**
- Check if resend-theme.css is loaded
- Verify NotesView.tsx has new checkbox code
- Check console for CSS/JS errors

---

## 🚀 Advanced Testing (Optional)

### 4. Test Offline Mode (3 minutes)

**Steps:**
1. Open DevTools → Network tab
2. Change "Online" dropdown to "Offline"
3. Check a habit, check a task, check a note checkbox
4. Open Console → Look for "Offline - queueing" message
5. Open Application tab → Local Storage → Look for pending updates
6. Change back to "Online"
7. Wait 2 seconds
8. Look for "Connection restored - syncing" message
9. Refresh page
10. Verify all changes persisted

**Expected Result:**
- ✅ Changes work when offline
- ✅ Updates queued in localStorage
- ✅ Auto-sync on reconnection
- ✅ All data intact after refresh

---

### 5. Test Checkbox Keyboard Navigation (2 minutes)

**Steps:**
1. Open a note
2. Insert a checkbox list
3. Type text in first item
4. Press Enter (should create new item)
5. Press Backspace on empty item (should delete it)
6. Use arrow keys to move between items
7. Check/uncheck with mouse
8. Verify strikethrough applies

**Expected Result:**
- ✅ Enter creates new checkbox item
- ✅ Backspace deletes empty items
- ✅ Arrow keys navigate correctly
- ✅ Visual feedback on all actions

---

## 🐛 Common Issues & Quick Fixes

### Issue: "persistenceService is not defined"

**Fix:**
```typescript
// In App.tsx, verify this import exists:
import { persistenceService } from './services/persistenceService';
```

### Issue: Checkbox button not showing

**Fix:**
1. Check browser console for errors
2. Verify NotesView.tsx has the toolbar button code
3. Try refreshing with Cmd/Ctrl + Shift + R (hard refresh)

### Issue: Styles not applying

**Fix:**
1. Check if resend-theme.css is loaded (DevTools → Sources)
2. Verify CSS has checkbox styles at the bottom
3. Clear browser cache and refresh

### Issue: Offline sync not working

**Fix:**
1. Check if localStorage has write permissions
2. Open Console → Type `localStorage.getItem('taskly.offline_updates')`
3. Should return null or JSON array
4. Clear if corrupted: `localStorage.removeItem('taskly.offline_updates')`

---

## 📊 Performance Checks

### Check Database Write Frequency

**Steps:**
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Interact with app (check habits, tasks)
4. Count requests per second

**Expected:**
- Before: ~1 request/second (auto-save)
- After: ~1-2 requests/second (auto-save + persistence)
- Should NOT see constant stream of requests

### Check localStorage Size

**Steps:**
1. DevTools → Application → Local Storage
2. Look for keys starting with `taskly.`
3. Check size of offline queue

**Expected:**
- Offline queue: <1KB normally
- Should clear after successful sync
- No old/stale entries

---

## ✅ Sign-Off Checklist

Before considering implementation complete:

- [ ] All 3 quick tests pass
- [ ] No console errors
- [ ] No network errors
- [ ] Checkboxes look correct (green gradient)
- [ ] Strikethrough applies on check
- [ ] Data persists after refresh
- [ ] Offline mode works
- [ ] Performance is acceptable
- [ ] Mobile view tested (or responsive mode in DevTools)

---

## 📝 Test Results Template

Copy and fill this out:

```
## Test Results - [Your Name] - [Date]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile/Tablet]
- Screen Size: [Width x Height]

### Test 1: Habit Persistence
- Status: [PASS/FAIL]
- Notes: 

### Test 2: Task Persistence
- Status: [PASS/FAIL]
- Notes:

### Test 3: Note Checkboxes
- Status: [PASS/FAIL]
- Notes:

### Test 4: Offline Mode (Optional)
- Status: [PASS/FAIL/SKIPPED]
- Notes:

### Test 5: Keyboard Nav (Optional)
- Status: [PASS/FAIL/SKIPPED]
- Notes:

### Overall Assessment
- Ready for Production: [YES/NO]
- Concerns:
- Recommendations:
```

---

## 🚀 Ready to Deploy?

If all tests pass:
1. ✅ Create pull request
2. ✅ Tag for code review
3. ✅ Deploy to staging
4. ✅ QA team testing
5. ✅ Deploy to production

If any test fails:
1. ❌ Document the issue
2. ❌ Check relevant documentation
3. ❌ Fix and re-test
4. ❌ Repeat until all pass

---

## 📞 Need Help?

**Resources:**
- `PERSISTENCE_FEATURES_IMPLEMENTATION.md` - Full technical docs
- `USER_GUIDE_NEW_FEATURES.md` - User-facing guide
- `VISUAL_GUIDE.md` - Visual reference
- Browser DevTools Console - Error messages

**Questions?**
- Check console logs first
- Review implementation docs
- Contact development team

---

**Happy Testing! 🎉**

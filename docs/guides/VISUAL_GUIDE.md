# Visual Guide - New Persistence Features

This guide shows you exactly where to find and how to use the new features.

---

## 🎯 Feature 1: Instant Saving

### Where to See It

#### In Habits View:
```
┌─────────────────────────────────────────────────┐
│ Habits                          [+ New Habit]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  🏃 Morning Run                                 │
│  Every day                                      │
│                                                 │
│  Mo  Tu  We  Th  Fr  Sa  Su                    │
│  [✓] [✓] [ ] [✓] [ ] [ ] [ ]  ← Click any day │
│                      ↑                          │
│              Saves in ~500ms!                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### In Tasks View:
```
┌─────────────────────────────────────────────────┐
│ Tasks                           [+ New Task]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 Weekly Groceries                           │
│                                                 │
│  [ ] Buy milk        ← Click checkbox          │
│  [✓] Get bread       ← Instantly saved!        │
│  [ ] Pick up eggs                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Visual Feedback

**Before Click:**
```
[ ] Unchecked item
```

**After Click (Instant!):**
```
[✓] Checked item with green gradient
    ↓
Strikethrough applied
```

**Saving Animation:**
```
[✓] Item text...  💾 (Brief save indicator)
```

---

## ✅ Feature 2: Checkbox Lists in Notes

### Toolbar Location

#### Desktop View:
```
┌────────────────────────────────────────────────────┐
│ 📄 My Note                                    [⋮]  │
├────────────────────────────────────────────────────┤
│                                                    │
│ [T▼] [B] [I] [U] | [•] [1.] [☑] | [img] [<>] ["]│
│                          ↑                         │
│                   Checkbox button!                 │
│                                                    │
│ (Your note content appears here)                   │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Mobile View:
```
┌──────────────────────────────┐
│ 📄 My Note            [⋮]    │
├──────────────────────────────┤
│                              │
│ [T▼] [B] [I] [U] [⋮]        │
│                    ↑         │
│           Tap for more tools │
│                              │
│  ┌─────────────────────────┐│
│  │ ☑ Checklist            ││
│  │ 🖼 Insert Image         ││
│  │ " Blockquote           ││
│  │ <> Code Block          ││
│  └─────────────────────────┘│
│                              │
└──────────────────────────────┘
```

### Creating a Checkbox List

**Step 1: Click the button**
```
☑ Checklist button appears in toolbar
  ↓
Click it!
```

**Step 2: First item appears**
```
[ ] |  ← Cursor is here, start typing
```

**Step 3: Add more items**
```
[✓] Buy milk
[ ] Get bread  ← Press Enter to add
[ ] |          ← New item ready
```

### Checkbox Styles

**Unchecked State:**
```
┌─────────────────────────┐
│ [ ] Your item text      │
│  ↑                      │
│  Empty checkbox         │
│  Light border           │
└─────────────────────────┘
```

**Hover State:**
```
┌─────────────────────────┐
│ [ ] Your item text      │
│  ↑                      │
│  Subtle highlight       │
│  Border brightens       │
└─────────────────────────┘
```

**Checked State:**
```
┌─────────────────────────┐
│ [✓] Your item text      │
│  ↑        ↑             │
│  Green   Strikethrough  │
│  Gradient & muted color │
└─────────────────────────┘
```

### Example Note with Checkboxes

```
┌──────────────────────────────────────┐
│ 📄 Meeting Notes - Oct 14            │
├──────────────────────────────────────┤
│                                      │
│ # Action Items                       │
│                                      │
│ [✓] Send meeting summary to team    │
│ [ ] Schedule follow-up for next week│
│ [ ] Update project timeline         │
│ [✓] Share designs with stakeholders │
│                                      │
│ ## Notes                             │
│                                      │
│ • Discussed Q4 goals                │
│ • Team velocity is improving        │
│ • Need more resources for Sprint 3  │
│                                      │
└──────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Checkbox States

**Unchecked:**
- Border: `rgba(129, 140, 248, 0.4)` (Soft purple-blue)
- Background: Transparent
- Hover: `rgba(139, 92, 246, 0.08)` (Light purple tint)

**Checked:**
- Background: `linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))`
- Border: `rgba(34, 197, 94, 0.8)`
- Shadow: `0 2px 8px rgba(34, 197, 94, 0.3)`
- Checkmark: White `✓`

**Focus:**
- Ring: `0 0 0 3px rgba(139, 92, 246, 0.25)`

---

## ⌨️ Keyboard Shortcuts

### In Checkbox Lists

```
Enter              → Add new checkbox item below
Backspace (empty)  → Delete current item
Tab                → (Coming soon) Indent item
Shift + Tab        → (Coming soon) Outdent item
```

### General Editing

```
Cmd/Ctrl + B       → Bold text
Cmd/Ctrl + I       → Italic text
Cmd/Ctrl + U       → Underline text
```

---

## 📱 Mobile Experience

### Tap Targets

```
Minimum size: 44px × 44px (Apple guidelines)
Actual size:  48px × 48px (Extra comfortable!)

[  ☐  ] ← Easy to tap
 44×44px
```

### Responsive Layout

**Phone (Portrait):**
```
┌────────────────┐
│ Compact toolbar│
│ [T] [B] [⋮]   │
│                │
│ Note content   │
│                │
│ [ ] Checkbox   │
│     items      │
│     stack      │
│     nicely     │
└────────────────┘
```

**Tablet/Desktop:**
```
┌──────────────────────────┐
│ Full toolbar visible     │
│ [T] [B] [I] [U] [☑]...  │
│                          │
│ Note content             │
│                          │
│ [ ] Checkboxes  [ ] More│
│     Side by side         │
└──────────────────────────┘
```

---

## 🔄 Sync Indicator

### Visual States

**Saving:**
```
┌─────────────────┐
│ [✓] Item... 💾  │  ← Brief save icon
└─────────────────┘
```

**Saved:**
```
┌─────────────────┐
│ [✓] Item... ✓   │  ← Success checkmark
└─────────────────┘
```

**Offline:**
```
┌─────────────────┐
│ [✓] Item... 📴  │  ← Offline indicator
│ (Will sync later)│
└─────────────────┘
```

**Error:**
```
┌─────────────────┐
│ [✓] Item... ⚠️  │  ← Warning icon
│ (Tap to retry)  │
└─────────────────┘
```

---

## 🎭 Animation States

### Checkbox Check Animation

```
Frame 1: [ ]        (Normal size)
Frame 2: [■]        (Slightly larger)
Frame 3: [✓]        (Pop effect)
Frame 4: [✓]        (Settle to normal)

Total duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Strikethrough Animation

```
Before:  Item text
         ↓
After:   Item text
         ────────
         (Animates from left to right)

Duration: 150ms
```

---

## 📊 Status Indicators

### In Console (for developers)

```javascript
// Success
✅ Updates saved to database

// Offline
📴 Offline - queueing updates for later sync

// Sync
📡 Connection restored - syncing offline updates...

// Loaded
📥 Loaded 3 pending updates from offline queue

// Error
❌ Failed to save updates: [error message]
```

---

## 🎯 Quick Reference

### What Gets Saved Immediately?

✅ Habit day completions  
✅ Task checkbox states  
✅ Note checkbox states  
✅ All edits in notes  

### How Fast?

⚡ Visual update: Instant (0ms)  
⚡ Database save: ~500ms  
⚡ Offline sync: When online  

### Where to Find Features?

📍 Habits: Click any day on habit cards  
📍 Tasks: Click checkboxes in task lists  
📍 Notes: Click ☑ button in toolbar  

---

**End of Visual Guide**

For more details, see:
- `USER_GUIDE_NEW_FEATURES.md` - Comprehensive user guide
- `PERSISTENCE_FEATURES_IMPLEMENTATION.md` - Technical documentation

# Request Cards Visual Update & Project Linking - October 14, 2025

## Summary

Enhanced Request cards to match the Habits look and feel while fully implementing the ability to link requests to projects. This creates visual consistency across the app and provides better project organization for incoming requests.

---

## 1. Visual Updates - Match Habits Design

### What Changed

**Before:**
- Plain list items with minimal visual hierarchy
- No icon representation
- Inline badges and buttons
- Basic hover states

**After:**
- Card-based layout with rounded corners (`rounded-xl`)
- Priority-colored icon circle (40x40) matching the Habits design
- Consistent padding (`p-3`)
- Smooth hover effect (`hover:shadow-md`)
- Clean group hover for menu button (opacity transition)
- Proper spacing and layout structure

### Card Structure (List View)

```
┌─────────────────────────────────────────────┐
│ [Icon]  Title | Requester    [P] [S] [⋮]   │
│         [Project Badge]                      │
│         Problem description...               │
│         #expertise #tags                     │
└─────────────────────────────────────────────┘
```

**Key Features:**
- **Icon Circle**: 40x40 rounded square with priority-colored background (20% opacity)
- **Concierge Icon**: Material Symbol in full color matching priority
- **Title Row**: Name, requester, badges, and menu all aligned
- **Project Badge**: Inline badge with project icon and color when linked
- **Problem Text**: Line-clamped at 2 lines for consistency
- **Expertise Tags**: Rounded pills showing requested skills

### Card Structure (Board View)

```
┌─────────────────────────┐
│ [Icon] Title       [⋮] │
│        [Project Badge]  │
│        Problem...       │
└─────────────────────────┘
```

**Compact Design:**
- Smaller layout for board columns
- Same icon treatment
- Menu on hover (group-hover:opacity-100)
- Project badge below title when present

### Priority Colors

| Priority  | Color Code | Icon Background |
|-----------|-----------|-----------------|
| Critical  | `#DC2626` | `rgba(220, 38, 38, 0.2)` |
| High      | `#F97316` | `rgba(249, 115, 22, 0.2)` |
| Medium    | `#FBBF24` | `rgba(251, 191, 36, 0.2)` |
| Low       | `#10B981` | `rgba(16, 185, 129, 0.2)` |

---

## 2. Project Linking Feature

### Database Schema

Added `projectId` field to Request type:

```typescript
export type Request = {
  // ... existing fields
  projectId?: string; // Link to project
  // ... rest
};
```

### Request Intake Form

**New Project Selector:**
- Dropdown added after "Affected Users" field
- Shows all available projects
- Optional selection (can be "No project")
- Persists when editing existing requests

```tsx
<select 
  value={local.projectId || ''} 
  onChange={e => handle('projectId', e.target.value || undefined)} 
  className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
>
  <option value="">No project</option>
  {projects.map(p => (
    <option key={p.id} value={p.id}>{p.name}</option>
  ))}
</select>
```

### Project Badge Display

When a request is linked to a project:

**List View:**
```tsx
{project && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 max-w-[50%]">
    <Icon name={project.icon || 'folder'} className="text-xs" style={{ color: project.color }} />
    <span className="truncate">{project.name}</span>
  </span>
)}
```

**Board View:**
```tsx
{project && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-[10px] mt-1">
    <Icon name={project.icon || 'folder'} className="text-[10px]" style={{ color: project.color }} />
    <span className="truncate">{project.name}</span>
  </span>
)}
```

### Project Filtering

**Enhanced Filters Hook:**
Updated `utils/useRequestsFilters.ts` to include project filtering:

```typescript
type PersistedFilters = {
  status: RequestStatus | 'all';
  priority: RequestPriority | 'all';
  expertise: string;
  projectId: string; // NEW
  sortBy: RequestsSort;
};
```

**Unified Toolbar Integration:**
Both RequestsListPage and RequestsBoardPage now show project filter:

```tsx
<UnifiedToolbar
  projects={projects}
  selectedProjectId={projectId}
  onChangeProject={setProjectId}
  hideCategory
  // ... other props
/>
```

**Filter Logic:**
```typescript
if (projectId !== 'all' && r.projectId !== projectId) return false;
```

---

## 3. Files Modified

### Types & Data
- **`types.ts`**
  - Added `projectId?: string` to Request interface

### Components
- **`components/RequestsListPage.tsx`**
  - Complete card redesign with icon circle
  - Added project badge rendering
  - Updated to receive and use `projects` prop
  - Integrated project filtering
  - Changed from panel layout to individual cards with spacing

- **`components/RequestsBoardPage.tsx`**
  - Updated card styling to match list view
  - Added project badge to compact cards
  - Added project filtering support
  - Improved menu button positioning

- **`components/RequestIntakeForm.tsx`**
  - Added `projects` prop to component interface
  - Added project dropdown selector
  - Initialized `projectId` in local state
  - Form submission includes projectId

### Utilities
- **`utils/useRequestsFilters.ts`**
  - Added `projectId` to persisted filters
  - Added state management for project filter
  - Updated save/load logic

### App Integration
- **`App.tsx`**
  - Passed `projects` prop to RequestsListPage
  - Passed `projects` prop to RequestsBoardPage
  - Passed `projects` prop to RequestIntakeForm

---

## 4. Visual Comparison

### Before: Request List

```
────────────────────────────────
Title | Requester
Problem...
#tag #tag
[Priority] [Status]           [⋮]
────────────────────────────────
```

### After: Request List

```
┌─────────────────────────────────┐
│ [🔷]  Title | Requester  [P] [S] [⋮] │
│       [📁 Project]                │
│       Problem description...      │
│       #tag #tag #tag             │
└─────────────────────────────────┘
```

### Before: Request Board Card

```
┌──────────────┐
│ Title   [•]  │
│ Problem...   │
│ [Button]     │
└──────────────┘
```

### After: Request Board Card

```
┌──────────────┐
│ [🔷] Title [⋮]│
│ [📁 Project] │
│ Problem...   │
└──────────────┘
```

---

## 5. Design Consistency with Habits

### Shared Design Patterns

| Element | Habits | Requests (New) |
|---------|--------|----------------|
| Icon size | 40x40 (w-10 h-10) | 40x40 (w-10 h-10) ✅ |
| Icon shape | rounded-lg | rounded-lg ✅ |
| Icon background | Color + 20% opacity | Priority color + 20% opacity ✅ |
| Card padding | p-3 | p-3 ✅ |
| Card corners | rounded-xl | rounded-xl ✅ |
| Hover effect | hover:shadow-md | hover:shadow-md ✅ |
| Menu button | opacity-0 group-hover:opacity-100 | opacity-0 group-hover:opacity-100 ✅ |
| Project badge | Yes (with icon + color) | Yes (with icon + color) ✅ |
| Layout spacing | gap-0.5 for content | gap-0.5 for content ✅ |

---

## 6. User Experience Improvements

### Before This Update

❌ Requests looked visually different from Habits  
❌ No way to link requests to projects  
❌ No project filtering for requests  
❌ Inconsistent card layouts across views  
❌ Plain list appearance without visual hierarchy  

### After This Update

✅ **Visual Consistency** - Requests now match Habits design  
✅ **Project Organization** - Link requests to projects for better tracking  
✅ **Unified Filtering** - Filter requests by project like Habits  
✅ **Better Hierarchy** - Icon circles provide clear visual priority  
✅ **Cleaner Layout** - Individual cards with proper spacing  
✅ **Project Context** - See which project a request belongs to at a glance  
✅ **Persistent Filters** - Project filter persists across sessions  

---

## 7. Usage Examples

### Creating a Request with Project

1. Click "New Request"
2. Fill in required fields (Product, Requester, Problem, Expertise)
3. **Select a project** from the Project dropdown
4. Submit

The request now appears with the project badge in both list and board views.

### Filtering Requests by Project

**Desktop:**
1. Open Requests page (list or board view)
2. Use the Project dropdown in the toolbar
3. Select a specific project or "All Projects"
4. View updates instantly

**Mobile:**
1. Tap "Filters" button
2. Navigate to project selection (when added to mobile filters)
3. Select project and apply

### Visual Identification

- **Critical Priority**: Red icon background
- **High Priority**: Orange icon background  
- **Medium Priority**: Yellow icon background
- **Low Priority**: Green icon background
- **Project Badge**: Shows project icon + name below title
- **Hover State**: Card elevates with shadow

---

## 8. Technical Details

### Component Props Updated

**RequestsListPage:**
```typescript
interface Props {
  requests: Request[];
  projects: Project[]; // NEW
  // ... existing props
}
```

**RequestsBoardPage:**
```typescript
interface Props {
  requests: Request[];
  projects: Project[]; // NEW
  // ... existing props
}
```

**RequestIntakeForm:**
```typescript
interface Props {
  // ... existing props
  projects: Project[]; // NEW
}
```

### Filter Persistence

```typescript
// Stored in localStorage as 'requests.filters.v1'
{
  status: 'all',
  priority: 'all',
  expertise: 'all',
  projectId: 'all', // NEW
  sortBy: 'updated'
}
```

---

## 9. Benefits

### For Product Teams
- Organize incoming requests by project
- Quick visual identification by priority
- Filter requests to focus on specific initiatives
- See project context without opening details

### For Designers/Developers
- Consistent design language across features
- Reusable patterns (icon circles, badges, cards)
- Better visual hierarchy
- Easier to scan and understand status

### For Users
- Beautiful, modern interface
- Clear visual priority indicators
- Easy project association
- Familiar interaction patterns

---

## 10. Future Enhancements

### Potential Improvements

1. **Bulk Actions** - Select multiple requests and assign to project
2. **Project Stats** - Show request count per project in filter
3. **Auto-Assignment** - Suggest project based on request content
4. **Project Templates** - Pre-fill expertise based on project type
5. **Mobile Filter Panel** - Add project to mobile bottom sheet
6. **Smart Sorting** - Sort by project + priority combined
7. **Color Coding** - Use project colors for visual grouping

---

## 11. Testing Recommendations

### Visual Testing
1. ✅ Verify icon circles display with correct colors
2. ✅ Check hover states work smoothly
3. ✅ Confirm project badges appear when linked
4. ✅ Test card spacing and alignment
5. ✅ Validate menu button visibility on hover

### Functional Testing
1. ✅ Create request with project - verify saves
2. ✅ Edit request and change project - verify updates
3. ✅ Filter by project - verify correct results
4. ✅ Filter combinations (project + status + priority)
5. ✅ Verify filter persistence after page reload
6. ✅ Drag-drop on board still works
7. ✅ Mobile responsiveness

### Cross-Feature Testing
1. ✅ Compare with Habits cards - visual consistency
2. ✅ Test with many requests to verify performance
3. ✅ Test with long project names - truncation works
4. ✅ Test with no projects - form still works
5. ✅ Test legacy requests (no projectId) - graceful handling

---

## 12. Migration Notes

### Existing Data
- All existing requests without `projectId` will work fine
- Field is optional, so no migration required
- Project badge only shows when `projectId` is set
- Filter defaults to "All Projects" for backward compatibility

### Rollback Plan
If needed, changes can be reverted:
```bash
git checkout HEAD~1 -- types.ts
git checkout HEAD~1 -- components/RequestsListPage.tsx
git checkout HEAD~1 -- components/RequestsBoardPage.tsx
git checkout HEAD~1 -- components/RequestIntakeForm.tsx
git checkout HEAD~1 -- utils/useRequestsFilters.ts
git checkout HEAD~1 -- App.tsx
```

---

## Credits

**Date:** October 14, 2025  
**Designer/Developer:** GitHub Copilot with UX-first approach  
**Approved by:** Leo de Souza  
**Design Pattern:** Inspired by Habits view consistency  

---

**End of Document**

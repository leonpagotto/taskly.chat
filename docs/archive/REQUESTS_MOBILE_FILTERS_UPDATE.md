# Requests Mobile/Tablet Filters Update

## Overview
Combined status, priority, and expertise filters into a single "Filters" button that triggers a bottom sheet panel on mobile and tablet views (below lg breakpoint).

## Changes Made

### 1. RequestsListPage.tsx
- **Updated filter visibility logic** (line ~145):
  - Changed from: `hidden w-full gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-3`
  - Changed to: `hidden lg:flex lg:flex-wrap lg:gap-3`
  - **Effect**: Individual filter dropdowns now only show on desktop (lg+), completely hidden on mobile/tablet

### 2. RequestsBoardPage.tsx
- **Added mobile filters drawer support**:
  - Added `CloseIcon` to imports
  - Added `mobileFiltersOpen` state management
  - Implemented mobile filters trigger button (shows < lg breakpoint)
  - Added bottom sheet modal with all three filters (status, priority, expertise)
  - Added "Reset" and "Apply" buttons in the drawer
  - Individual dropdowns now only show on desktop (lg+)

## User Experience

### Mobile & Tablet (< 1024px)
- Single "Filters" button displays with filter icon
- Active filter indicator (colored dot) shows when filters are applied
- Clicking opens bottom sheet with:
  - Status dropdown
  - Priority dropdown
  - Expertise dropdown
  - Reset button (clears all filters)
  - Apply button (closes drawer)
- Backdrop overlay for easy dismissal

### Desktop (≥ 1024px)
- Individual filter dropdowns display inline as before
- No changes to desktop experience

## Visual Design
- **Trigger Button**: White/transparent with subtle border, gradient shadow
- **Drawer**: Dark slate background (`bg-slate-950`) with rounded top corners
- **Active Indicator**: Small purple dot (`bg-[var(--color-primary-600)]`)
- **Spacing**: Consistent 3-unit gaps between filter controls
- **Accessibility**: Proper ARIA labels and roles

## Technical Details

### Breakpoint
- Uses Tailwind `lg:` prefix (1024px by default)
- Mobile/Tablet: `< 1024px`
- Desktop: `≥ 1024px`

### State Management
- `mobileFiltersOpen`: Boolean state for drawer visibility
- Shared filter state from `useRequestsFilters` hook:
  - `status`, `setStatus`
  - `priority`, `setPriority`
  - `expertise`, `setExpertise`

### Components Used
- `UnifiedToolbar`: Container for filters and controls
- Individual dropdowns: `StatusDropdown`, `PriorityDropdown`, `ExpertiseDropdown`
- Icons: `filter_alt`, `close`

## Testing Checklist
- [ ] Filters button shows on mobile/tablet views
- [ ] Individual dropdowns hidden on mobile/tablet
- [ ] Individual dropdowns show on desktop
- [ ] Drawer opens/closes correctly
- [ ] Active filter indicator appears when filters are applied
- [ ] Reset button clears all filters
- [ ] Apply button closes drawer
- [ ] Backdrop dismisses drawer on click
- [ ] Filters work correctly in both List and Board modes
- [ ] No layout shifts when toggling between modes

## Files Modified
1. `/components/RequestsListPage.tsx` - Updated filter visibility classes
2. `/components/RequestsBoardPage.tsx` - Added complete mobile filters implementation

## Related Components
- `UnifiedToolbar.tsx` - Filter container
- `useRequestsFilters.ts` - Shared filter state hook
- `RequestsSortDropdown.tsx` - Sort control (remains separate on mobile)

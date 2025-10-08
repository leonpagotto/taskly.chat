# Empty State Standards

## Overview
This document defines the standardized approach for empty states across Taskly.Chat to ensure consistency and better user experience.

## Empty State Component
The primary `EmptyState` component (`components/EmptyState.tsx`) provides a unified interface for displaying empty states throughout the app.

### Component Props
```typescript
interface EmptyStateProps {
  icon: React.ReactElement;           // Icon to display
  title: React.ReactNode;             // Primary heading
  description?: React.ReactNode;      // Optional description text
  primaryAction?: EmptyStateAction;   // Optional primary CTA button
  secondaryAction?: EmptyStateAction; // Optional secondary action
  className?: string;                 // Additional CSS classes
  children?: React.ReactNode;         // Custom content
  variant?: 'elevated' | 'minimal';   // Display variant
}
```

### Variants
1. **Elevated** (default): Glass-morphism card with gradient overlay, shadow, and backdrop blur
   - Use for: Main page empty states, standalone views
   - Example: Projects list, Categories list

2. **Minimal**: Transparent background, no card styling
   - Use for: Content area empty states, inline messages
   - Example: Filtered results, embedded sections

## Usage Guidelines

### Full Page Empty States
Use the `EmptyState` component with `variant="minimal"` for full-width page empty states:

```tsx
<EmptyState
  icon={<IconComponent />}
  title="No items yet"
  description="Get started by creating your first item."
  primaryAction={{
    label: 'Create Item',
    onClick: handleCreate,
    icon: <AddIcon className="text-base" />,
  }}
  variant="minimal"
  className="mx-auto my-16 w-full max-w-3xl"
/>
```

### Filtered Results Empty States
For empty states caused by active filters, provide a reset action:

```tsx
<EmptyState
  icon={<Icon name="filter_alt_off" />}
  title="No items match the current filters"
  description="Try adjusting your filters to see more results."
  secondaryAction={{
    label: 'Reset filters',
    onClick: handleResetFilters,
    icon: <Icon name="filter_alt_off" className="text-base" />,
    variant: 'secondary',
  }}
  variant="minimal"
  className="mx-auto my-16 w-full max-w-3xl"
/>
```

### Inline/Contextual Messages
For simple empty messages within panels or cards, use minimal styled text:

```tsx
<div className="text-center py-8">
  <p className="text-sm text-gray-400 dark:text-gray-500">No items available</p>
</div>
```

**Text Color Standards:**
- Use `text-gray-400 dark:text-gray-500` for better contrast and readability
- Avoid `text-gray-500 dark:text-gray-400` or italic styling

## Standardized Components

### ✅ Using EmptyState Component
- **ListsView**: No tasks, no filtered results
- **CategoriesView**: No categories
- **ProjectsListPage**: No projects
- **ProjectsView**: Initial state
- **RequestsListPage**: No requests, filtered results
- **RequestsBoardPage**: No requests, filtered results
- **StoriesView**: No stories, filtered results
- **HabitsView**: No habits
- **FilesView**: No files
- **NotesListPage**: No notes selected

### ✅ Inline Messages (Standardized)
- **Dashboard**: "No tasks or habits for this day" in day view panels
- **StoriesView**: "No stories yet" in kanban columns
- **GlobalSearch**: "No results found" / "Start typing to search"
- **ProjectDetailsView**: "No conversations" in sidebar

### ℹ️ Special Cases (Intentional Custom Design)
- **Dashboard**: Main empty state with multiple action buttons (uses EmptyStateIcon)
- **ChatView**: Welcome message with personality and quick prompts
- **NotesListPage**: "Opening a fresh note..." loading state

## Color Palette Reference

### Empty State Text Colors
```css
/* Primary text (titles) */
.text-slate-50      /* For elevated variant titles */
.text-slate-100     /* For minimal variant titles */
.text-gray-800 dark:text-white /* Legacy, being phased out */

/* Secondary text (descriptions) */
.text-slate-300/95  /* For elevated variant */
.text-slate-300/90  /* For minimal variant */

/* Inline/contextual messages */
.text-gray-400 dark:text-gray-500 /* Standard inline empty text */
```

## Migration Notes

### Changes Applied
1. **ListsView.tsx**: Replaced custom empty state markup with `EmptyState` component for both "no tasks" and "no filtered results" scenarios
2. **CategoriesView.tsx**: Replaced dashed border card with `EmptyState` component
3. **Dashboard.tsx**: Standardized inline message colors from `text-gray-500 dark:text-gray-400` to `text-gray-400 dark:text-gray-500`
4. **StoriesView.tsx**: Simplified kanban column empty message with consistent colors
5. **GlobalSearch.tsx**: Updated text colors for better contrast
6. **ProjectDetailsView.tsx**: Standardized "no conversations" message color

### Files Modified
- `components/ListsView.tsx` - Added EmptyState import, replaced custom markup
- `components/CategoriesView.tsx` - Added EmptyState import, replaced custom markup
- `components/Dashboard.tsx` - Updated text colors for inline messages
- `components/StoriesView.tsx` - Simplified and standardized kanban empty states
- `components/GlobalSearch.tsx` - Updated text colors
- `components/ProjectDetailsView.tsx` - Updated text colors

## Best Practices

1. **Consistency**: Always use the `EmptyState` component for page-level empty states
2. **Actionability**: Include a primary action when users can create or add items
3. **Filter Awareness**: For filtered results, offer a way to reset or adjust filters
4. **Context**: Use inline messages for contextual empty states within panels
5. **Accessibility**: Always include descriptive text, not just icons
6. **Responsiveness**: Use responsive text sizing (`text-2xl sm:text-3xl`)
7. **Spacing**: Use consistent padding classes (`mx-auto my-16 w-full max-w-3xl`)

## Future Improvements

- Consider adding animation/transitions for empty state appearance
- Add illustration variants for different contexts
- Create empty state variants for error states vs no-content states
- Document loading state patterns to complement empty states

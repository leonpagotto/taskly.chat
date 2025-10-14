# Font System Standards

## Overview
Taskly.Chat uses a consistent, two-font system across the entire application to maintain visual hierarchy and readability.

## Font Families

### Primary Font: Space Grotesk
**Usage:** Headings, titles, page headers, section titles, brand elements
**Rationale:** Modern, geometric sans-serif that provides strong visual hierarchy

### Secondary Font: Inter  
**Usage:** Body text, paragraphs, labels, navigation, buttons, forms, UI elements
**Rationale:** Highly readable, designed for screen legibility, excellent for UI

## Font Hierarchy

### Headings (Space Grotesk)
```css
h1, h2 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 700; /* bold */
  letter-spacing: -0.02em;
}

h3, h4, h5, h6 {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-weight: 600; /* semibold */
  letter-spacing: -0.02em;
}
```

### Body Text (Inter)
```css
p, span, label, li, div {
  font-family: 'Inter', sans-serif;
  font-weight: 400; /* normal */
  letter-spacing: -0.01em;
}
```

### Navigation & UI (Inter)
```css
nav, button, a {
  font-family: 'Inter', sans-serif;
  font-weight: 500; /* medium */
}
```

## Component-Specific Guidelines

### Empty States
- **Title:** Use `h2` with `font-semibold` (Space Grotesk, 600 weight)
- **Description:** Use `p` with normal weight (Inter, 400 weight)
```tsx
<h2 className="text-2xl font-semibold">Title</h2>
<p className="text-base text-slate-300/90">Description text</p>
```

### Sidebar Navigation
- **Section Headers:** `font-semibold` (600), uppercase, tracking-wider
- **Nav Items:** `font-medium` (500), regular case
- **Active State:** `font-medium` with color emphasis

```tsx
// Section header
<h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
  Section Name
</h2>

// Nav item
<span className="text-sm font-medium">Item Name</span>
```

### Page Headers
- Use `h1` with `font-bold` (700)
- Size: `text-3xl` to `text-5xl` depending on context

```tsx
<h1 className="text-4xl font-bold tracking-tight">Page Title</h1>
```

### Card Titles
- Use `h3` or `h4` with `font-semibold` (600)
- Size: `text-lg` to `text-xl`

```tsx
<h3 className="text-lg font-semibold">Card Title</h3>
```

### Form Labels
- Use Inter with `font-medium` (500) or `font-semibold` (600)
- Size: `text-sm` or `text-xs`

```tsx
<label className="text-sm font-semibold text-gray-300">Field Label</label>
```

### Buttons
- Use Inter with `font-semibold` (600)
- Size: `text-sm` or `text-base`

```tsx
<button className="text-sm font-semibold">Action</button>
```

### Badges & Pills
- Use Inter with `font-semibold` (600)
- Size: `text-xs`

```tsx
<span className="text-xs font-semibold">Badge</span>
```

## Weight Reference

| Weight | Tailwind Class | Numeric Value | Usage |
|--------|---------------|---------------|-------|
| Normal | `font-normal` | 400 | Body text, descriptions |
| Medium | `font-medium` | 500 | Navigation, UI elements |
| Semibold | `font-semibold` | 600 | Section titles, buttons, h3-h6 |
| Bold | `font-bold` | 700 | Page titles, h1-h2 |

## Letter Spacing

- **Headings:** `-0.02em` (tighter for visual impact)
- **Body Text:** `-0.01em` (subtle for readability)
- **All Caps Labels:** `0.05em` to `0.18em` (wider for legibility)

## Do's and Don'ts

### ✅ Do
- Use Space Grotesk for all headings and titles
- Use Inter for all body text, navigation, and UI elements
- Maintain consistent font weights across similar elements
- Use `font-semibold` for section headers
- Use `font-medium` for navigation items
- Keep letter spacing consistent with the defined values

### ❌ Don't
- Mix font families within the same text hierarchy
- Use more than 3 font weights in a single component
- Apply bold weight to body text (use semibold instead)
- Use light weights (300 or below) for small text
- Forget to specify font-family when overriding defaults

## CSS Variables

```css
:root {
  --resend-font-sans: 'Space Grotesk', 'Inter', 'Segoe UI', system-ui, sans-serif;
  --resend-font-body: 'Inter', 'Segoe UI', system-ui, sans-serif;
  --resend-letter-spacing: -0.01em;
  --resend-letter-spacing-heading: -0.02em;
}
```

## Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" />
```

## Examples by Context

### Landing Page
```tsx
// Hero title
<h1 className="text-5xl font-bold">Transform Your Productivity</h1>

// Feature title
<h3 className="text-lg font-semibold">Feature Name</h3>

// Body text
<p className="text-base">Description of the feature...</p>
```

### Dashboard
```tsx
// Page title
<h1 className="text-3xl font-bold">Dashboard</h1>

// Widget title
<h3 className="text-base font-semibold">Tasks & Habits</h3>

// Item name
<p className="text-sm font-medium">Task name</p>
```

### Modal / Dialog
```tsx
// Modal title
<h2 className="text-lg font-semibold">Edit Project</h2>

// Form label
<label className="text-sm font-semibold">Project Name</label>

// Description text
<p className="text-sm text-gray-400">Enter a name for your project</p>
```

## Migration Notes

### Files Modified
1. `/styles/resend-theme.css` - Updated CSS variables and global styles
2. `/index.html` - Updated body and heading font-family declarations
3. `/components/Sidebar.tsx` - Updated section headers to font-semibold

### Breaking Changes
None - all changes are additive and improve consistency

## Testing Checklist

- [ ] Verify all page titles use Space Grotesk
- [ ] Verify all body text uses Inter
- [ ] Check navigation items use font-medium
- [ ] Check section headers use font-semibold
- [ ] Verify empty states use consistent fonts
- [ ] Test on different screen sizes
- [ ] Verify font loading performance
- [ ] Check accessibility (contrast ratios maintained)

## Maintenance

When adding new components:
1. Use `h1`-`h6` for titles (automatic Space Grotesk)
2. Use `p`, `span`, `label` for body text (automatic Inter)
3. Apply appropriate font-weight classes based on element type
4. Reference this document for specific use cases

## Future Improvements

- Consider adding variable fonts for better performance
- Evaluate adding a monospace font for code snippets
- Monitor web vitals impact of font loading
- Consider font subsetting for further optimization

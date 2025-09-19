# Task: IMP-104
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related: task:IMP-101
Owner:

## Summary
Light theming & styling alignment for integrated Lobe Chat components to match Taskly brand primitives (colors, typography, spacing) without deep refactor.

## Acceptance Criteria
- [ ] Color palette mapped to existing CSS variables / Tailwind tokens (no raw hex in new adapter layer).
- [ ] Typography inherits from global layout; no font flashes/regressions.
- [ ] Dark mode baseline verified (no unreadable contrast in primary surfaces & message bubbles).
- [ ] At least 3 core surfaces (background, message inbound, message outbound) aligned with brand tokens.
- [ ] No introduction of global conflicting styles (scoped or utility-based approach documented).
- [ ] Visual regression quick capture (screenshots or manual checklist) stored or referenced.

## Implementation Notes
- Defer until IMP-101 stable to avoid churn.
- Consider CSS variables façade if framework uses hardcoded tokens.

## Progress Log
- 2025-09-19 Task created.

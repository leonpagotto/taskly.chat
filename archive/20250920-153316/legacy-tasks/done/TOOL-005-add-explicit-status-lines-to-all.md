# Task: TOOL-005
Status: done
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: chore
Related: [story:10-engineering-automation]
Owner: system

## Summary
Add explicit `Status:` lines to all `story.md` files missing them using taxonomy: Draft | Planned | Active | Paused | Done.

## Acceptance Criteria
- [ ] All story.md have a Status line
- [ ] Existing Status values preserved if present
- [ ] Newly inferred status defaults to Draft

## Implementation Notes
- Scan `docs/taskly-chat/stories/*/story.md`
- If no `Status:` line, insert after title H1

## Progress Log
- 2025-09-19 00:00 Created.

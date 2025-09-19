# Task: Implement Spec Index Generator
Status: Backlog
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Create a script to scan `docs/taskly-chat/stories/*` and produce `docs/taskly-chat/SPEC-INDEX.md` summarizing story metadata and task counts by status.

## Acceptance Criteria
- [ ] Script outputs deterministic ordering by story number
- [ ] Includes columns: Story, Title, Status, Backlog, InProgress, Review, Done
- [ ] Skips non-story directories
- [ ] Handles missing status folders gracefully (zero counts)
- [ ] Available via `pnpm spec:index`

## Implementation Notes
- Derive story number & slug from folder name `<number>-<slug>`
- Title: first line of `story.md` after `#` prefix
- Status: parse `Status:` line inside story.md
- Count tasks: list `*.md` files in each status subfolder (exclude nested directories)

## Progress Log
- 2025-09-19 00:00 Created.

# Task: IMP-203
Status: backlog
Story: 15-import-render-sync-tasks-stories
Created: 2025-09-20
Type: feature
Related: task:IMP-202
Owner:

## Summary
Implement internal board model mapping status directories to column descriptors and task ordering.

## Acceptance Criteria
- [ ] Columns derived from existing status directories (backlog, todo, in-progress, review, done).
- [ ] Stable ordering for tasks within a column preserved unless user reorders.
- [ ] Provides diff of ordering vs last synced state.

## Implementation Notes
Builds atop parser (IMP-202) to assemble columns & ordering diff baseline.

## Progress Log
- 2025-09-20 Promoted to global backlog
- 2025-09-20 Stub created in story backlog

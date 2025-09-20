# Task: IMP-202
Status: Backlog
Story: 15-import-render-sync-tasks-stories
Created: 2025-09-20
Type: feature
Related: task:IMP-201
Owner:

## Summary
Parse story and task markdown headers into normalized in-memory models.

## Acceptance Criteria
- [ ] Supports story headers & task headers per structure doc.
- [ ] Ignores unknown header lines gracefully.
- [ ] Associates tasks to stories via `Story:` field or sets NONE.
- [ ] Reports malformed files (missing Task ID or Status) with warnings list.

## Implementation Notes
Promoted with dependency on IMP-201; foundation for modeling & diff.

## Progress Log
- 2025-09-20 Promoted to global backlog
- 2025-09-20 Stub created in story backlog

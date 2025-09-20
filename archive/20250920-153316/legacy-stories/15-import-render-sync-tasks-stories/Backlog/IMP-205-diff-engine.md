# Task: IMP-205
Status: backlog
Story: 15-import-render-sync-tasks-stories
Created: 2025-09-20
Type: feature
Related: task:IMP-202 task:IMP-203
Owner:

## Summary
Compute bidirectional diff between current board model and filesystem / repo snapshot.

## Acceptance Criteria
- [ ] Detects moves (status changes), creates, deletes, content edits (header changes).
- [ ] Hash comparison used to detect content edits.
- [ ] Outputs structured diff object consumed by sync subsystem.

## Progress Log
- 2025-09-20 Stub created in story backlog

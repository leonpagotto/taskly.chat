# Task: IMP-207
Status: backlog
Story: 15-import-render-sync-tasks-stories
Created: 2025-09-20
Type: feature
Related: task:IMP-205
Owner:

## Summary
Update in-memory board model by re-reading filesystem and merging external changes.

## Acceptance Criteria
- Detects external moves & new tasks.
- Flags conflicts where a task both changed externally and locally (hash mismatch + dirty).
- Provides conflict list to UI.

## Progress Log
- 2025-09-20 Stub created in story backlog

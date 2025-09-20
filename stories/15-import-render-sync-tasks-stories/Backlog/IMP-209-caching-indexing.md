# Task: IMP-209
Status: backlog
Story: 15-import-render-sync-tasks-stories
Created: 2025-09-20
Type: chore
Related: task:IMP-202 task:IMP-205
Owner:

## Summary
Introduce caching / indexing layer to accelerate imports and diff generation for large repositories.

## Acceptance Criteria
- Caches file hashes & parsed headers (in-memory + optional on-disk session cache).
- Skips re-parse when hash unchanged.
- Measures and logs import time improvements.

## Progress Log
- 2025-09-20 Stub created in story backlog

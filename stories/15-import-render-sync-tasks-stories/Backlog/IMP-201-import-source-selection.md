# Task: IMP-201
Status: backlog
Story: 15-import-render-sync-tasks-stories
Created: 2025-09-20
Type: feature
Related:
Owner:

## Summary
Implement user flow to select a local folder or provide a GitHub repo URL for import.

## Acceptance Criteria
- UI allows local folder selection (File System Access API fallback docs if unsupported).
- UI accepts GitHub HTTPS URL (public) and validates accessibility.
- Basic validation errors surfaced (unreachable, empty, unsupported structure).
- Emits normalized source descriptor object to ingestion pipeline.

## Progress Log
- 2025-09-20 Stub created in story backlog

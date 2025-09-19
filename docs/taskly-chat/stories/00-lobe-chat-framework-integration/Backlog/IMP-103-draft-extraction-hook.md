# Task: IMP-103
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Migrated legacy task. Improve this summary.

## Acceptance Criteria
- [ ] Define criteria

## Implementation Notes
- Migrated by normalize-tasks script

## Progress Log
- 2025-09-19 Normalized legacy file

## Legacy Body

---
id: IMP-103
title: Task Draft Extraction Event Hook
status: Backlog
responsibleArea: Full-stack Software Engineer
---
Add event listener / middleware in Lobe Chat message pipeline to call our `extractTaskDrafts` after user message submission and attach results to message metadata panel.

Acceptance Criteria:
- Hook triggers exactly once per user message.
- Extraction results accessible in UI for confirmation.
- Performance: extraction finishes < 300ms for heuristic mode.

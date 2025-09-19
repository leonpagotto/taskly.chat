# Task: DOC-001
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
id: DOC-001
title: Document Lobe Chat Integration Boundaries & Module Resolution Strategy
status: Completed
responsibleArea: Full-stack Software Engineer
---
Add architecture subsection clarifying which concerns stay in upstream framework vs Taskly domain packages.

Acceptance Criteria:
- Section added to `ARCHITECTURE.md` describing Lobe integration boundaries (framework vs Taskly ownership, extension points).
- Upgrade strategy & fork avoidance policy documented.
- Workspace Module Resolution Strategy documented (paths, composite builds, no transpilePackages, barrel export conventions, client component directive usage).
- Task status updated to Completed once architecture doc reflects both scopes.

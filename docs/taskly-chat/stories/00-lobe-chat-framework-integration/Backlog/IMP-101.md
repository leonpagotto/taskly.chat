# Task: IMP-101
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
id: IMP-101
title: Implement Minimal Lobe Chat Mount
status: Backlog
responsibleArea: Full-stack Software Engineer
---
Mount baseline Lobe Chat component inside `apps/chat` replacing custom `ChatShell` while preserving temporary task draft extraction panel.

Acceptance Criteria:
- Import and render Lobe Chat root component.
- Provide placeholder system prompt injection (merged instruction layers).
- Maintain local message state bridging to framework message model.
- Fallback gracefully if framework not available (dev mode warning).

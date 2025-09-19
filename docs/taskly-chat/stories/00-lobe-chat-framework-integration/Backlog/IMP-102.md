# Task: IMP-102
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
id: IMP-102
title: Create Instruction Layer Injection Adapter
status: Backlog
responsibleArea: Full-stack Software Engineer
---
Implement adapter translating our `InstructionLayer` array into the shape expected by Lobe Chat for system prompt customization.

Acceptance Criteria:
- Adapter function with tests (once test harness added).
- Graceful handling of empty layers.
- Single exported util from `@taskly/ai` or a new `@taskly/integration` package.

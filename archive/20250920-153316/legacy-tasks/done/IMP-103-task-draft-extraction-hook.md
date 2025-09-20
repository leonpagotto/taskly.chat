# Task: IMP-103
Status: done
Story: 00-lobe-chat-framework-integration
Created: 2025-09-20
Updated: 2025-09-20
Type: feature
Related: task:IMP-101 task:IMP-102
Owner:

## Summary
Introduce a reusable hook that observes outbound user messages and produces task draft artifacts (and future memory signals) decoupled from ChatShell UI logic.

## Acceptance Criteria
- [x] Hook `useTaskDraftExtraction` created under `apps/chat/src/components/` (or `hooks/`).
- [x] Accepts latest user message content and returns extracted `TaskDraft[]` plus raw parse (future-proof for enrichment).
- [x] Graceful handling of empty or whitespace messages (returns empty drafts array).
- [x] Side-effect free (no direct fetch) – delegates parsing to existing local utilities (placeholder) for now.
- [x] Unit test scaffold or clear TODO markers for future test coverage. (Implemented `useTaskDraftExtraction.spec.tsx`).

## Implementation Notes
Initial version wraps existing `extractTaskDrafts` util and memoizes result.

## Progress Log
- 2025-09-20 Created task file in todo
- 2025-09-20 Promoted to in-progress; initial hook stub present
- 2025-09-20 (agent) Added test spec `useTaskDraftExtraction.spec.tsx`
- 2025-09-20 (agent) All AC satisfied; moved to review
- 2025-09-20 (agent) Promoted to done after validation pass

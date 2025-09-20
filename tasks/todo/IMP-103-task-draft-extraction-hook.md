# Task: IMP-103
Status: todo
Story: 00-lobe-chat-framework-integration
Created: 2025-09-20
Type: feature
Related: task:IMP-101 task:IMP-102
Owner:

## Summary
Introduce a reusable hook that observes outbound user messages and produces task draft artifacts (and future memory signals) decoupled from ChatShell UI logic.

## Acceptance Criteria
- Hook `useTaskDraftExtraction` created under `apps/chat/src/components/` (or `hooks/`).
- Accepts latest user message content and returns extracted `TaskDraft[]` plus raw parse (future-proof for enrichment).
- Graceful handling of empty or whitespace messages (returns empty drafts array).
- Side-effect free (no direct fetch) – delegates parsing to existing local utilities (placeholder) for now.
- Unit test scaffold or clear TODO markers for future test coverage.

## Implementation Notes
Initial version can wrap existing `extractTaskDrafts` util but isolates transformation for future multi-step extraction (intent parse + memory referencing).

Proposed signature:
```ts
interface DraftExtractionResult { drafts: TaskDraft[]; parse?: any }
function useTaskDraftExtraction(latest?: string): DraftExtractionResult
```
Return value memoized by input string.

## Progress Log
- 2025-09-20 Created task file in todo

## Future Enhancements
- Integrate streaming parse endpoint
- Emit diagnostics (confidence distribution)
- Attach memory references when memory subsystem lands

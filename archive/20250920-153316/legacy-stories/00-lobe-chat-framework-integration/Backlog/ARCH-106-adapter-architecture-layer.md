# Task: ARCH-106
Status: backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related: task:IMP-101 task:IMP-102 task:IMP-103
Owner:

## Summary
Consolidate integration concerns into a single adapter layer exporting stable domain-level events & utilities insulating upstream Lobe API changes.

## Acceptance Criteria
- [ ] Single module (e.g. `packages/integration/src/adapter.ts`) exports: `injectSystemPrompt`, `onMessagePersisted`, `emitDraftTasks`.
- [ ] No other code imports Lobe internals directly (search/grep passes).
- [ ] Adapter unit tests (mocks) cover each export's contract.
- [ ] Public TypeScript types defined & re-exported (MessageEnvelope, DraftTaskCandidate, InstructionPromptMeta).
- [ ] Safety: throws or logs structured error when upstream contract mismatch detected.
- [ ] Architecture doc updated with responsibility table; direct import ban noted.

## Implementation Notes
- Introduce lightweight runtime guard on expected shape of upstream message objects.
- Consider feature flag gating each adapter surface.

## Progress Log
- 2025-09-19 Task created.

# Task: IMP-101
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Introduce a minimal mount point for future Lobe Chat integration by stubbing a `LobeChatMount` component that will later wrap the real framework. This iteration replaces the existing `ChatShell` visually while preserving task draft extraction and instruction prompt visibility.

## Acceptance Criteria
- [ ] New component `LobeChatMount` exists under `apps/chat/src/components/`.
- [ ] Component receives props: `mergedSystemPrompt` (string) and internally shows placeholder panel referencing it.
- [ ] Graceful fallback message shown if underlying provider (future Lobe) not yet installed.
- [ ] Existing task draft extraction UI still accessible (no regression in parsing / draft display from `ChatShell`).
- [ ] Old `ChatShell` no longer rendered on root page (import removed or gated).
- [ ] Typecheck & build succeed.
- [ ] Progress Log updated with implementation date.

## Implementation Notes
- Keep `ChatShell` file for diff history but stop rendering it; may salvage logic for later message bridging.
- Use dynamic import boundary (future streaming / provider injection point).
- Provide a small interface for future message send hook.

## Progress Log
- 2025-09-19 Normalized legacy file
- 2025-09-20 Refined scope; began implementation (stub component planned)
- 2025-09-20 Stub component created, merged instruction hook added, page wired (pending commit)

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

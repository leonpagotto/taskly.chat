# Task: IMP-101
Status: in-progress
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Introduce a minimal mount point for future Lobe Chat integration by stubbing a `LobeChatMount` component that will later wrap the real framework. This iteration replaces the existing `ChatShell` visually while preserving task draft extraction and instruction prompt visibility.

## Acceptance Criteria (Initial Pull)
- [x] Stub component `LobeChatMount` exists under `apps/chat/src/components/`.
- [x] Component shows merged system prompt panel.
- [x] `ChatShell` replaced on home page.
- [ ] Mark task Done once real Lobe dependency integrated.

## Progress Log
- 2025-09-19 Normalized legacy file
- 2025-09-20 Implementation stub completed & migrated to pipeline

## Migration Note
Formerly located at `stories/00-lobe-chat-framework-integration/Backlog/IMP-101-minimal-lobe-mount.md` (removed to avoid duplication).

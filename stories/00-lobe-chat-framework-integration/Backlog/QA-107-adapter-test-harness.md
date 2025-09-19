# Task: QA-107
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related: task:IMP-102 task:IMP-103 task:ARCH-106
Owner:

## Summary
Establish minimal test harness for adapter & extraction logic to prevent regressions as integration evolves.

## Acceptance Criteria
- [ ] Test script alias added to workspace (e.g. `pnpm test:integration`).
- [ ] Unit tests cover: system prompt build (empty, single, multi-layer), draft extraction hook (fires once), adapter error path.
- [ ] Coverage report (if tool available) shows >70% lines for integration package.
- [ ] CI executes tests (failures block merge).
- [ ] Mocks isolate framework-specific heavy modules (fast test runtime < 3s).

## Implementation Notes
- Use Vitest (already present) or Jest; prefer Vitest for consistency.
- Consider snapshot for combined prompt string output.

## Progress Log
- 2025-09-19 Task created.

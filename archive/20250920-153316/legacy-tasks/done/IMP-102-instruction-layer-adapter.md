# Task: IMP-102
Status: done
Story: 00-lobe-chat-framework-integration
Created: 2025-09-20
Updated: 2025-09-20
Type: chore
Related:
Owner:

> Migrated from story backlog (Backlog/IMP-102-instruction-layer-adapter.md) on pull into central pipeline. Original status Backlog.

## Summary
Create Instruction Layer Injection Adapter that converts our internal `InstructionLayer[]` into the structure required by the eventual Lobe Chat framework integration for system prompt customization.

## Acceptance Criteria
- [x] Gracefully handles empty layers (returns minimal array or placeholder)
- [x] Flattens layer content into ordered string segments preserving priority
- [x] Excludes disabled layers (future-proof: skip if `enabled === false` when field exists)
- [x] Exported utility available via `@taskly/ai`
- [x] Unit test scaffold placeholder (implemented as `packages/ai/src/instructionAdapter.spec.ts`)

## Implementation Notes
Internal shape (current): see `packages/ai/src/instructions.ts` for `InstructionLayer` type. Adapter maps to array of `{ role: 'system'; content }` with ordering global -> project -> context.

## Progress Log
- 2025-09-20 Pulled into pipeline as todo
- 2025-09-20 Promoted to in-progress; adapter initial implementation present
- 2025-09-20 (agent) Added unit tests file `instructionAdapter.spec.ts`
- 2025-09-20 (agent) All AC satisfied; moved to review
- 2025-09-20 (agent) Promoted to done after validation pass

# Task: IMP-102
Status: in-progress
Story: 00-lobe-chat-framework-integration
Created: 2025-09-20
Type: chore
Related:
Owner:

> Migrated from story backlog (Backlog/IMP-102-instruction-layer-adapter.md) on pull into central pipeline. Original status Backlog.

## Summary
Create Instruction Layer Injection Adapter that converts our internal `InstructionLayer[]` into the structure required by the eventual Lobe Chat framework integration for system prompt customization.

## Acceptance Criteria
- Gracefully handles empty layers (returns minimal array or placeholder)
- Flattens layer content into ordered string segments preserving priority
- Excludes disabled layers (future-proof: skip if `enabled === false` when field exists)
- Exported utility available via `@taskly/ai`
- Unit test scaffold placeholder (can be completed in later task)

## Implementation Notes
Internal shape (current): see `packages/ai/src/instructions.ts` for `InstructionLayer` type. Adapter will map to an array of objects each with `role: system` and merged content string.

Proposed function signature (initial):
```ts
export interface AdaptedInstructionSegment { role: 'system'; content: string }
export function adaptInstructionLayers(layers: InstructionLayer[]): AdaptedInstructionSegment[]
```
Concatenate `layer.content` ensuring newline separation. Consider trimming trailing whitespace.

## Progress Log
- 2025-09-20 Pulled into pipeline as todo
- 2025-09-20 Promoted to in-progress; adapter initial implementation present

## Legacy Body (for reference)
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

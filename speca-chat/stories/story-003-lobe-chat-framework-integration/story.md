<!-- Generated/Normalized from template on 2025-09-20 -->
# Story: 00-lobe-chat-framework-integration

## Summary
Integrate foundational Lobe Chat provider/framework to enable unified instruction layering and future conversational orchestration.

## Motivation
TODO: Describe why a shared provider abstraction reduces duplication.

## Desired Outcomes
- Core provider interface available.
- Instruction layering functional.

## Scope
In Scope:
- Minimal provider wrapper.

Out of Scope (Initial):
- Advanced memory retrieval integration.

## Success Metrics
- Provider used by at least one AI feature without ad-hoc code.

## Risks
- Lock-in to provider API surface.

## Assumptions
- Future adapters can extend without breaking core.

## Open Questions
1. How to version instruction layer changes?

## Related Stories / Tasks
- story-001 task extraction (depends on provider).

## Narrative Notes
Focus on thin abstraction to avoid premature complexity.

## Progress Log
- 2025-09-20 Narrative scaffold added.

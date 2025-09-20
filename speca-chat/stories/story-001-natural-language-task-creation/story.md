<!-- Generated/Normalized from template on 2025-09-20 -->
# Story: 01-natural-language-task-creation

## Summary
Enable users to type natural language instructions and have the system extract structured task drafts automatically.

## Motivation
TODO: Elaborate key user pain (manual task entry friction) and strategic alignment (AI assisted capture).

## Desired Outcomes
- Users can input free-form text and see suggested task drafts.
- Reduced time from idea to actionable task.

## Scope
In Scope:
- Draft extraction from single conversational message.

Out of Scope (Initial):
- Multi-message aggregation.

## Success Metrics
- Draft acceptance rate (% of suggested tasks accepted by user) baseline TBD.

## Risks
- Over-extraction noise lowering trust.

## Assumptions
- Users will refine drafts before finalizing.

## Open Questions
1. Should we auto-create tasks or always require confirmation?

## Related Stories / Tasks
- story-003 (framework integration) – provides instruction layering.

## Narrative Notes
Initial implementation focuses on deterministic / simple heuristic before advanced model refinement.

## Progress Log
- 2025-09-20 Narrative scaffold added.

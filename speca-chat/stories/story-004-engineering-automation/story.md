<!-- Generated/Normalized from template on 2025-09-20 -->
# Story: 10-engineering-automation

## Summary
Automate routine engineering workflows (scaffolding, validation, board generation) to reduce friction and enforce governance consistency.

## Motivation
TODO: Detail time savings + reduction of manual errors in governance.

## Desired Outcomes
- Scripted story/task scaffolding.
- Automatic board regeneration.

## Scope
In Scope:
- CLI scripts under `speca-chat/scripts`.

Out of Scope (Initial):
- GUI wizard for scaffolding.

## Success Metrics
- Average setup time for new story < 30s.

## Risks
- Over-automation hiding necessary review.

## Assumptions
- Contributors run pnpm scripts locally pre-commit.

## Open Questions
1. Add pre-push validation gate?

## Related Stories / Tasks
- story-002 ingestion (automation helps sync). 

## Narrative Notes
Will iterate with additional linting heuristics after baseline adoption.

## Progress Log
- 2025-09-20 Narrative scaffold added.

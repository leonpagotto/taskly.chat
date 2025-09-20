<!-- Normalized from legacy mixed format on 2025-09-20 -->
# Story: 02-retrieve-conversation-history

## Summary
Allow users and AI to access prior conversation messages for contextually grounded assistance and task extraction.

## Motivation
Legacy need: users retyped context. Provide continuity & reduce friction.

## Desired Outcomes
- Conversation history can be fetched for current session.
- AI responses leverage relevant prior turns.

## Scope
In Scope:
- Retrieval of last N messages.

Out of Scope (Initial):
- Full semantic search across archives.

## Success Metrics
- Reduction in user re-typing past info (qualitative early).

## Risks
- Performance degradation with large histories.

## Assumptions
- History size manageable in early phase.

## Open Questions
1. Pagination vs streaming for long threads?

## Related Stories / Tasks
- story-001 extraction (context dependency).

## Narrative Notes
Future enhancement: vector index for long-term recall.

## Progress Log
- 2025-09-20 Narrative scaffold added; legacy draft replaced.

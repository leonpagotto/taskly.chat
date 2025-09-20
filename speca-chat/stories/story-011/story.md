<!-- Generated/Normalized from template on 2025-09-20 -->
# Story: 08-integrate-with-google-calendar-read-only

## Summary
Provide read-only calendar integration to surface upcoming events and contextual planning suggestions.

## Motivation
Users want schedule awareness inside assistant.

## Desired Outcomes
- Events appear in context panel.
- Conflicts highlighted for scheduling tasks.

## Scope
In Scope:
- OAuth & event fetch.

Out of Scope (Initial):
- Write operations.

## Success Metrics
- Connections established count.

## Risks
- Token refresh complexity.

## Assumptions
- Limited event volume per user initially.

## Open Questions
1. Cache strategy TTL?

## Related Stories / Tasks
- story-016 write access extension.

## Narrative Notes
Set foundation for future mutation.

## Progress Log
- 2025-09-20 Narrative scaffold added.
Created: 2025-09-19
Owner: 
Area: integrations

Status: Draft
---
id: 7a6b5c4d-3e2f-1a9b-8c7d-6e5f4a3b2c1d
title: Integrate with Google Calendar (Read-Only)
priority: Medium
---
As a user, I want to securely connect my Google Calendar to Taskly.chat, allowing the AI to read my schedule, so it can provide more accurate and timely suggestions and reminders.

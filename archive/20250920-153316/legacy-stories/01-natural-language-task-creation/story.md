# Story: title: Natural Language Task Creation
Slug: 01-natural-language-task-creation
Status: draft
Created: 2025-09-19
Owner: 
Area: nlp-intake

## Plan (Initial)
1. UI Foundation: Implement minimal yet extensible chat interface (DEV-001) – already prototyped via `ChatShell`, needs upgrade to production design alignment (DES-001 alignment later).
2. Intent & Entity Extraction (DEV-002): Start with rule-based / heuristic model wrappers (OpenAI function calling fallback) before custom training.
3. Response Generation (DEV-003): System for confirmations / clarifications using templated responses + AI fill.
4. Backend Orchestration (IMP-001): Single POST endpoint orchestrating: parse -> extract -> persist (stubs until persistence added).
5. Persistence Layer (DES-002 + IMP-002): Introduce schema (initially tasks table only, reminders/ideas stubbed).
6. Error & Confidence Handling (INT-001): Standard error object shape and user-facing messaging.
7. E2E Validation (CON-001): Scenario matrix after core flow is functional.

## Dependencies
- Requires initial framework enablement (Story 00) for production chat UI foundation.

## Out of Scope (Phase 1)
- Recurrence rules persistence
- Multi-user collaboration
- Full reminder scheduling engine

# Task: IMP-001
Status: backlog
Story: 01-natural-language-task-creation
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Migrated legacy task. Improve this summary.

## Acceptance Criteria
- [ ] Define criteria

## Implementation Notes
- Migrated by normalize-tasks script (relocated back from global backlog centralization)

## Progress Log
- 2025-09-19 Normalized legacy file
- 2025-09-20 Relocated to story Backlog (governance update)

## Legacy Body

---
id: IMP-001
title: Implement Backend API for Natural Language Input Processing
status: InProgress
responsibleArea: Full-stack Software Engineer
---
Create a Next.js API endpoint that receives the user's natural language input and orchestrates NLP parsing + persistence preparation.

Acceptance Criteria:
- Endpoint: `POST /api/nlp/parse` with JSON body `{ text: string }`.
- Validates input length (max 2k chars) and type.
- Invokes `parseUserInput` (from DEV-002 output).
- Returns JSON: `{ intent, entities, confidence, missing, raw }`.
- If intent is `create_task` and no blocking `missing`, respond with `proposedTask` object (not persisted yet).
- Handles and logs errors with a structured error response `{ error: { code, message } }`.

Out of Scope:
- Actual DB persistence
- Auth / multi-user context
- Rate limiting

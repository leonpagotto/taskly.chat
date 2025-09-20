# Task: DEV-002
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
id: DEV-002
title: Develop NLP Model for Intent Recognition and Entity Extraction
status: InProgress
responsibleArea: AI/Machine Learning Engineer
---
Design, train, and integrate an NLP model (or structured LLM prompt + function calling pipeline) capable of understanding user intent and extracting relevant entities from natural language input.

Phase 1 Scope (Heuristic + LLM Hybrid):
- Supported intents: `create_task`, `create_reminder`, `capture_idea`, `unknown`.
- Entities (task): `description`, optional `due_date` (ISO), optional `priority` (low|normal|high).
- Entities (reminder): `description`, `reminder_time` (ISO if present), `recurrence` (raw string if detected).
- Entities (idea): `content`.

Acceptance Criteria:
- Single exported function: `parseUserInput(text) => { intent, entities, confidence, missing: string[] }`.
- Confidence computation (simple heuristic based on presence of trigger verbs + model classification probability).
- Returns `missing` array for essential fields not derived (e.g., due_date when user expresses temporal intent like "tomorrow").
- Graceful fallback: if ambiguity > threshold, return `intent: 'unknown'` with reason note.

Future (Not in this task):
- Custom fine-tuned model
- Multi-lingual support
- Advanced recurrence parsing

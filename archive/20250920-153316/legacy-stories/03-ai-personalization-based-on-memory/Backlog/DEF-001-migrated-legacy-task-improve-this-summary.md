# Task: DEF-001
Status: backlog
Story: 03-ai-personalization-based-on-memory
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Define memory schema and extraction strategy for personalization

## Acceptance Criteria

- [ ] Identifying key entities and attributes for each memory type (e.g., `routine_name`, `time`, `frequency`; `preference_type`, `value`; `priority_item`, `due_date`; `event_name`, `date`)
- [ ] Mapping how these structured memories will be stored in PostgreSQL
- [ ] Defining how conversational context/semantic memory will be processed and embedded for storage in a vector database (Pinecone/Weaviate)
- [ ] Outlining the NLP techniques for extracting this information from user utterances

## Implementation Notes
- Migrated by normalize-tasks script

Auto-upgraded from legacy placeholder via upgrade-legacy-tasks script.


Acceptance criteria refined automatically from legacy bullet list.
## Progress Log
- 2025-09-20 Refined acceptance criteria (auto)

- 2025-09-19 Normalized legacy file
## Migration Note
Upgraded in-place; original legacy body retained below.

## Legacy Body
---
id: DEF-001
title: Define memory schema and extraction strategy for personalization
responsibleArea: AI/Machine Learning Engineer
---
Define the data model for storing user routines, preferences, priorities, and important dates. This includes:
- Identifying key entities and attributes for each memory type (e.g., `routine_name`, `time`, `frequency`; `preference_type`, `value`; `priority_item`, `due_date`; `event_name`, `date`).
- Mapping how these structured memories will be stored in PostgreSQL.
- Defining how conversational context/semantic memory will be processed and embedded for storage in a vector database (Pinecone/Weaviate).
- Outlining the NLP techniques for extracting this information from user utterances.
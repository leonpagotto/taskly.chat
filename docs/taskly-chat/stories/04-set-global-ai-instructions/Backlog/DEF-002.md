# Task: DEF-002
Status: Backlog
Story: 04-set-global-ai-instructions
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Migrated legacy task. Improve this summary.

## Acceptance Criteria
- [ ] Define criteria

## Implementation Notes
- Migrated by normalize-tasks script

## Progress Log
- 2025-09-19 Normalized legacy file

## Legacy Body

---
id: DEF-002
title: Define Database Schema for Global AI Instructions
responsibleArea: Full-stack Software Engineer
---
Design and implement the necessary database schema changes in PostgreSQL to persist global AI instructions for each user.
*   **Table Design:** Create a new table (e.g., `user_ai_settings`) or extend an existing user configuration table.
*   **Column Definition:** Define columns for `user_id` (foreign key), `preferred_tone` (TEXT/VARCHAR), `default_detail_level` (TEXT/VARCHAR or ENUM), `custom_instructions` (TEXT), `created_at`, and `updated_at`.
*   **Indexing:** Ensure `user_id` is indexed for efficient retrieval.
*   **Migration Script:** Write and test database migration scripts to apply these schema changes without data loss.
*   **Relationship Mapping:** Establish the one-to-one relationship between a user and their AI settings.

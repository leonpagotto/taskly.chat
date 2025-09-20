# Task: DES-002
Status: Backlog
Story: 01-natural-language-task-creation
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Design/Update Database Schemas for Tasks, Reminders, and Ideas

## Acceptance Criteria
- [ ] (Legacy acceptance criteria embedded in legacy body or to be refined)

## Implementation Notes
- Migrated by normalize-tasks script

Auto-upgraded from legacy placeholder via upgrade-legacy-tasks script.

## Progress Log
- 2025-09-19 Normalized legacy file

## Migration Note
Upgraded in-place; original legacy body retained below.

## Legacy Body
---
id: DES-002
title: Design/Update Database Schemas for Tasks, Reminders, and Ideas
responsibleArea: Full-stack Software Engineer
---
Define or update the PostgreSQL database schemas to store the structured data for tasks, reminders, and ideas, ensuring all extracted entities can be persisted. Specific tables and fields to consider:
*   `tasks` table: id, user_id, description, due_date, priority, status, created_at, updated_at.
*   `reminders` table: id, user_id, description, reminder_time, recurrence, status, created_at, updated_at.
*   `ideas` table: id, user_id, content, topic, created_at, updated_at.
*   Considering appropriate indexing and foreign key relationships (e.g., to user profiles).
# Task: IMP-009
Status: backlog
Story: 06-unified-task-management
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Implement Task Database Schema

## Acceptance Criteria

- [ ] Developing a `tasks` table with fields for `user_id`, `title`, `description`, `due_date` (nullable), `priority` (enum/int), `status` (enum), `category` (enum: 'personal', 'professional'), `created_at`, `updated_at`
- [ ] Ensuring proper indexing for `user_id`, `category`, and `due_date` for efficient queries
- [ ] Defining foreign key relationships (e.g., to users table)
- [ ] Implementing migration scripts for schema changes

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
id: IMP-009
title: Implement Task Database Schema
responsibleArea: Full-stack Software Engineer
---
Create and apply the necessary database schema changes to support the unified task data model. This includes:
*   Developing a `tasks` table with fields for `user_id`, `title`, `description`, `due_date` (nullable), `priority` (enum/int), `status` (enum), `category` (enum: 'personal', 'professional'), `created_at`, `updated_at`.
*   Ensuring proper indexing for `user_id`, `category`, and `due_date` for efficient queries.
*   Defining foreign key relationships (e.g., to users table).
*   Implementing migration scripts for schema changes.
# Task: IMP-009
Status: Backlog
Story: 06-unified-task-management
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
id: IMP-009
title: Implement Task Database Schema
responsibleArea: Full-stack Software Engineer
---
Create and apply the necessary database schema changes to support the unified task data model. This includes:
*   Developing a `tasks` table with fields for `user_id`, `title`, `description`, `due_date` (nullable), `priority` (enum/int), `status` (enum), `category` (enum: 'personal', 'professional'), `created_at`, `updated_at`.
*   Ensuring proper indexing for `user_id`, `category`, and `due_date` for efficient queries.
*   Defining foreign key relationships (e.g., to users table).
*   Implementing migration scripts for schema changes.

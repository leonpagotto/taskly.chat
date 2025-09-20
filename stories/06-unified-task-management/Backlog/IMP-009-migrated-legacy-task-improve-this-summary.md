# Task: IMP-009
Status: Backlog
Story: 06-unified-task-management
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Implement Task Database Schema

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
id: IMP-009
title: Implement Task Database Schema
responsibleArea: Full-stack Software Engineer
---
Create and apply the necessary database schema changes to support the unified task data model. This includes:
*   Developing a `tasks` table with fields for `user_id`, `title`, `description`, `due_date` (nullable), `priority` (enum/int), `status` (enum), `category` (enum: 'personal', 'professional'), `created_at`, `updated_at`.
*   Ensuring proper indexing for `user_id`, `category`, and `due_date` for efficient queries.
*   Defining foreign key relationships (e.g., to users table).
*   Implementing migration scripts for schema changes.
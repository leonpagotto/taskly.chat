# Task: UPD-001
Status: Backlog
Story: 07-share-project-with-collaborator
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
id: UPD-001
title: Update Database Schema for Project Collaboration
responsibleArea: Full-stack Software Engineer
---
Modify existing or create new database tables to support project ownership and collaboration.
*   **`projects` table**: Ensure an `owner_id` foreign key referencing the `users` table.
*   **`project_collaborators` table**: Create a new table with fields such as `project_id`, `user_id`, `permission_level` (e.g., 'view_only', 'editor', 'admin'), and `created_at`.
*   Ensure appropriate indexing for efficient querying of shared projects and collaborators.

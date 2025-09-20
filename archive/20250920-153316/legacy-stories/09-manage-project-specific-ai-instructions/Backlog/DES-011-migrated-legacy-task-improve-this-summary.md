# Task: DES-011
Status: backlog
Story: 09-manage-project-specific-ai-instructions
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Design and Implement Database Schema for Project AI Instructions

## Acceptance Criteria
- [ ] A new database table `project_ai_instructions` is created, linking to the `projects` table via a `project_id` foreign key.
- [ ] The table includes columns for `instruction_id` (primary key), `project_id`, `instruction_text` (TEXT/VARCHAR with support for markdown), `created_at`, and `updated_at`.
- [ ] Appropriate indexes are added to `project_id` for efficient lookups.
- [ ] Database migrations are prepared for deployment.

## Implementation Notes
- Migrated by normalize-tasks script

Auto-upgraded from legacy placeholder via upgrade-legacy-tasks script.

## Progress Log
- 2025-09-19 Normalized legacy file

## Migration Note
Upgraded in-place; original legacy body retained below.

## Legacy Body
---
id: DES-011
title: Design and Implement Database Schema for Project AI Instructions
responsibleArea: Full-stack Software Engineer
---
Design and implement the necessary database schema changes to store project-specific AI instructions. This will involve creating a new table or modifying an existing one to link instructions directly to individual projects.

*   **Acceptance Criteria:**
    *   A new database table `project_ai_instructions` is created, linking to the `projects` table via a `project_id` foreign key.
    *   The table includes columns for `instruction_id` (primary key), `project_id`, `instruction_text` (TEXT/VARCHAR with support for markdown), `created_at`, and `updated_at`.
    *   Appropriate indexes are added to `project_id` for efficient lookups.
    *   Database migrations are prepared for deployment.
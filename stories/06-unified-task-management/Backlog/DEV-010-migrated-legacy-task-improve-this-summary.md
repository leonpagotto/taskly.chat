# Task: DEV-010
Status: Backlog
Story: 06-unified-task-management
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Develop Task Management REST API Endpoints

## Acceptance Criteria

- [ ] `POST /api/tasks`: To create a new task with specified attributes, including category
- [ ] `GET /api/tasks`: To retrieve a list of tasks for the authenticated user, supporting filters by `category`, `status`, `due_date`, and sorting options
- [ ] `GET /api/tasks/{id}`: To retrieve a single task by its ID
- [ ] `PUT /api/tasks/{id}`: To update an existing task's details
- [ ] `DELETE /api/tasks/{id}`: To delete a task
- [ ] Implementing proper authentication and authorization checks for all endpoints

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
id: DEV-010
title: Develop Task Management REST API Endpoints
responsibleArea: Full-stack Software Engineer
---
Implement the backend RESTful API endpoints for comprehensive task management. This includes:
*   `POST /api/tasks`: To create a new task with specified attributes, including category.
*   `GET /api/tasks`: To retrieve a list of tasks for the authenticated user, supporting filters by `category`, `status`, `due_date`, and sorting options.
*   `GET /api/tasks/{id}`: To retrieve a single task by its ID.
*   `PUT /api/tasks/{id}`: To update an existing task's details.
*   `DELETE /api/tasks/{id}`: To delete a task.
*   Implementing proper authentication and authorization checks for all endpoints.
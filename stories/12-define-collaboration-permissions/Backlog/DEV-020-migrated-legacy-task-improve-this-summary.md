# Task: DEV-020
Status: Backlog
Story: 12-define-collaboration-permissions
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Develop Backend APIs for Project Collaborator Management

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
id: DEV-020
title: Develop Backend APIs for Project Collaborator Management
responsibleArea: Full-stack Software Engineer
---
Implement RESTful API endpoints for managing collaborators and their assigned roles within a project.
- `POST /projects/{projectId}/collaborators`: Add a user as a collaborator with a specified role.
- `PUT /projects/{projectId}/collaborators/{userId}`: Update an existing collaborator's role.
- `DELETE /projects/{projectId}/collaborators/{userId}`: Remove a collaborator from a project.
- `GET /projects/{projectId}/collaborators`: Retrieve a list of all collaborators and their roles for a project.
- API endpoints are secured and require appropriate authentication and authorization (e.g., only project owner or admin can modify permissions).
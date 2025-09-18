---
id: 7c1e5f8d-4a2b-4e6c-8a9d-1f0e3b2d1c4a
title: Implement Backend Logic to Assign Task Context
responsibleArea: Full-Stack Developer
---
Update the existing API endpoints for creating (POST /tasks) and updating (PUT /tasks/:id) tasks to accept and persist the `context` field. This ensures new and existing tasks can be assigned a 'personal' or 'professional' context.

### Acceptance Criteria:
*   The task creation API (POST /tasks) must accept a `context` field in the request body.
*   The task update API (PUT /tasks/:id) must accept a `context` field in the request body to modify an existing task's context.
*   The provided `context` value ('personal' or 'professional') must be stored correctly in the database.
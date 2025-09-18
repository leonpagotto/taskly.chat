---
id: b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e
title: 'Backend: Update Task API to support priority'
responsibleArea: Full-Stack Developer
---
Modify the existing RESTful API endpoints for creating and updating tasks to accept and persist the `priority` attribute. Implement server-side validation to ensure that only 'High', 'Medium', or 'Low' are accepted values.

*   **Acceptance Criteria:**
    *   `POST /api/tasks` endpoint accepts a `priority` field in the request body.
    *   `PUT /api/tasks/:id` and `PATCH /api/tasks/:id` endpoints accept a `priority` field for updates.
    *   Input validation is implemented for the `priority` field, returning a 400 error for invalid values.
    *   Retrieved tasks from `GET /api/tasks` and `GET /api/tasks/:id` include the `priority` field.
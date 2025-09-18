---
id: 4e1b3c6f-7a5c-4c01-8b2e-9d0a6f4e1b3c
title: Update Backend API for Task Due Dates
responsibleArea: Full-Stack Developer
---
Modify existing task creation and update API endpoints to accept and persist `dueDate`. Acceptance Criteria: - The `POST /tasks` endpoint should accept an optional `dueDate` field in the request body; - The `PUT /tasks/:id` or `PATCH /tasks/:id` endpoint should accept an optional `dueDate` field for updates; - The `GET /tasks` and `GET /tasks/:id` endpoints should return the `dueDate` field in the response; - Implement basic validation to ensure `dueDate` is a valid date format if provided.
---
id: a1b2c3d4-e5f6-7890-1234-567890abcdef
title: Implement API endpoint to fetch overdue and approaching tasks
responsibleArea: Full-Stack Developer
---
Create a new GET API endpoint (e.g., `/api/v1/tasks/summary/urgent`) that returns tasks classified as overdue or approaching their due date for the authenticated user.

*   **Acceptance Criteria:**
    *   The endpoint must authenticate the user using JWT.
    *   "Overdue" tasks are defined as tasks whose `due_date` is in the past and `is_completed` is `false`.
    *   "Approaching" tasks are defined as tasks whose `due_date` is within the next 7 days (inclusive of today) and `is_completed` is `false`. This threshold should be configurable (e.g., via environment variable).
    *   The response should include `id`, `title`, `description`, `due_date`, and a classification (`overdue` or `approaching`).
    *   Implement proper error handling and validation.
    *   Ensure the underlying database query is optimized for performance using appropriate indexes.
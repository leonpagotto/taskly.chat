---
id: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
title: Implement Backend Filtering API for Task Context
responsibleArea: Full-Stack Developer
---
Modify the GET /tasks endpoint to accept an optional query parameter, `context`, allowing users to retrieve tasks filtered by 'personal' or 'professional' categories. Tasks without a specified context should also be retrievable.

### Acceptance Criteria:
*   The GET /tasks endpoint must accept an optional query parameter, e.g., `/tasks?context=personal`.
*   If `context=personal` is provided, only tasks with 'personal' context should be returned.
*   If `context=professional` is provided, only tasks with 'professional' context should be returned.
*   If no `context` parameter is provided, all tasks (regardless of context) should be returned.
*   Error handling for invalid context values should be implemented (e.g., return 400 Bad Request).
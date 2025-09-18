---
id: b7c8d9e0-f1a2-4b3c-5d6e-7f8a9b0c1d2e
title: Develop Backend API for Task Summary
responsibleArea: Full-Stack Developer
---
Implement a new RESTful API endpoint to retrieve a summary of tasks for a given user within a specified date range and status.
*   An endpoint, e.g., `GET /api/users/{userId}/tasks/summary?period=daily&date=YYYY-MM-DD` or `?period=weekly&startDate=YYYY-MM-DD`.
*   The API should accept parameters for `userId`, `period` (e.g., 'day', 'week'), and relevant `date` or `startDate`/`endDate` range.
*   It should return counts for "completed tasks" and "pending tasks" for the specified period.
*   Utilize PostgreSQL queries to efficiently fetch and aggregate task data.
*   Implement JWT authentication and authorization to ensure only the authenticated user can access their task summary.
---
id: 1d83b1ce-0b0c-402a-bfcf-7a1a45938f32
title: Implement Backend API Endpoint for Updating Task Status
responsibleArea: Full-Stack Developer
---
Develop a `PATCH /api/tasks/{id}` API endpoint using Node.js/Express.js.
*   The endpoint should accept a request body containing `isCompleted: boolean`.
*   It must validate the input and ensure the `id` corresponds to an existing task.
*   Implement JWT-based authentication and authorization to ensure only the task's owner can update its status.
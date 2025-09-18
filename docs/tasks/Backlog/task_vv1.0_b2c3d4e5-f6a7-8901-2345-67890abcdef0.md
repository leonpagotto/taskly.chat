---
id: b2c3d4e5-f6a7-8901-2345-67890abcdef0
title: 'Backend: Create API Endpoint for User Tasks'
responsibleArea: Full-Stack Developer
---
Develop a new GET `/api/tasks/me` endpoint in Node.js with Express.js and TypeScript.
*   This endpoint must retrieve all tasks (personal and professional) associated with the authenticated user from the PostgreSQL database.
*   Implement JWT authentication to secure the endpoint.
*   Ensure the response includes relevant task details (e.g., `id`, `title`, `description`, `status`, `dueDate`, `projectId`).
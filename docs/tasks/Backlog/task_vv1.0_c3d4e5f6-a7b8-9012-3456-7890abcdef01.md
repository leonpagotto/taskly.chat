---
id: c3d4e5f6-a7b8-9012-3456-7890abcdef01
title: 'Backend: Create API Endpoint for User Projects'
responsibleArea: Full-Stack Developer
---
Develop a new GET `/api/projects/me` endpoint in Node.js with Express.js and TypeScript.
*   This endpoint must retrieve all projects (personal and professional) associated with the authenticated user from the PostgreSQL database.
*   Implement JWT authentication to secure the endpoint.
*   Ensure the response includes relevant project details (e.g., `id`, `title`, `description`, `status`, `startDate`, `endDate`).
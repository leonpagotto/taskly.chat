---
id: e0996253-1250-4824-a744-f187a41753c1
title: Develop API endpoint for updating existing tasks
responsibleArea: Full-Stack Developer
---
Implement a PUT or PATCH endpoint at /api/tasks/{id} using Node.js/Express and TypeScript. This endpoint will allow authenticated users to update the title, description, due_date, and priority of a specific task. It must include:
*   Input validation for all fields (e.g., string length, date format, priority enum).
*   JWT authentication to ensure authorized access.
*   Logic to interact with the PostgreSQL database to modify the corresponding task record.
*   Proper error handling for invalid input (400), unauthorized access (401/403), and task not found (404).
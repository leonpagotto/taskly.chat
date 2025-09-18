---
id: 528b7e23-7444-4630-9b43-9a4f41b3a32f
title: Implement Backend Service Logic to Update Task Completion
responsibleArea: Full-Stack Developer
---
Write the service layer logic in TypeScript to interact with the PostgreSQL database.
*   This function should take a `taskId` and `isCompleted` status as input.
*   It should update the `is_completed` column for the specified task in the `tasks` table.
*   Handle potential database errors gracefully.
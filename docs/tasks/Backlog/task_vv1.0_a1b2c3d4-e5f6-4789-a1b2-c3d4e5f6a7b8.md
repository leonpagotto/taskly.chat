---
id: a1b2c3d4-e5f6-4789-a1b2-c3d4e5f6a7b8
title: Design Database Schema for Projects
responsibleArea: Lead Software Engineer
---
Define the database schema for the `projects` table. This includes:
*   `id`: Primary key (UUID)
*   `title`: Project title (string, required)
*   `description`: Project description (text, optional)
*   `userId`: Foreign key referencing the `users` table, indicating ownership (UUID, required)
*   `createdAt`: Timestamp for creation
*   `updatedAt`: Timestamp for last update

Consider necessary indices for performance.
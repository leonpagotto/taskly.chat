---
id: 848d7955-4d7a-4c28-98e3-0d34ddb4923f
title: Ensure database schema supports all editable task attributes
responsibleArea: Full-Stack Developer
---
Verify that the PostgreSQL tasks table schema includes appropriate columns for title, description, due_date, and priority. If any of these are missing or need modification (e.g., adding constraints, changing data types for due_date or priority), implement the necessary database migrations. Ensure the ORM (e.g., TypeORM with Node.js) is configured to handle these fields for update operations.
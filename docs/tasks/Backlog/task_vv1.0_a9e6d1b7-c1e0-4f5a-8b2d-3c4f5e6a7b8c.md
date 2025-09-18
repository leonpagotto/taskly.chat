---
id: a9e6d1b7-c1e0-4f5a-8b2d-3c4f5e6a7b8c
title: 'Backend: Add 'priority' column to Task model'
responsibleArea: Full-Stack Developer
---
Modify the PostgreSQL `tasks` table schema to include a new column for task priority. This column should be a string type, ideally constrained by an ENUM or check constraint to 'High', 'Medium', 'Low'. Ensure appropriate default values or nullability are handled.

*   **Acceptance Criteria:**
    *   `priority` column added to the `tasks` table.
    *   Column type supports specified priority levels (e.g., `VARCHAR` with a `CHECK` constraint or a custom `ENUM` type).
    *   Database migration script is created and tested.
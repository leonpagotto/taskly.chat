---
id: f0e9d8c7-b6a5-4321-fedc-ba9876543210
title: Verify/Update database schema for task due dates and completion status
responsibleArea: Full-Stack Developer
---
Ensure the `tasks` table in PostgreSQL has the necessary columns and indexes to support identifying overdue and approaching tasks.

*   **Acceptance Criteria:**
    *   Confirm or add a `due_date` column of type `TIMESTAMP WITH TIME ZONE` (or `DATE` if time is not needed) to the `tasks` table.
    *   Confirm or add an `is_completed` column of type `BOOLEAN` with a default value of `false` to the `tasks` table.
    *   Create necessary database migration scripts (e.g., using TypeORM Migrations).
    *   Add database indexes to `user_id`, `due_date`, and `is_completed` columns to optimize query performance for task retrieval.
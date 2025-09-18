---
id: e4d5f7c3-a1b2-4d6c-8e9f-0c1d2a3b4e5f
title: Database Schema Review/Migration for Task Status and Dates
responsibleArea: Full-Stack Developer
---
Review and, if necessary, update the PostgreSQL database schema for the `tasks` table to ensure it properly supports task status and relevant date fields required for summary calculations.
*   Verify the `tasks` table has a `status` column (e.g., 'pending', 'completed') with an appropriate data type (e.g., `VARCHAR` or `ENUM`).
*   Verify the `tasks` table has a `createdAt` column (e.g., `TIMESTAMP WITH TIME ZONE`).
*   Ensure there's a `completedAt` or `updatedAt` column that can be used to track when a task was marked as completed. If not present, create a migration to add it.
*   All necessary indexes are in place for efficient querying by `userId`, `status`, and date fields.
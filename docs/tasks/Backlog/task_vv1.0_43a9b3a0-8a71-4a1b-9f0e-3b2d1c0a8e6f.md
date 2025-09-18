---
id: 43a9b3a0-8a71-4a1b-9f0e-3b2d1c0a8e6f
title: Database Schema Update for Task Context
responsibleArea: Full-Stack Developer
---
Modify the PostgreSQL `tasks` table to include a `context` column. This column should support values like 'personal' and 'professional' to categorize tasks.

### Acceptance Criteria:
*   The `tasks` table in PostgreSQL must have a new column named `context`.
*   The `context` column should be a `VARCHAR` or `ENUM` type capable of storing 'personal', 'professional', and potentially `NULL` (for tasks without a specific context initially).
*   Ensure proper indexing if performance issues are anticipated with filtering.
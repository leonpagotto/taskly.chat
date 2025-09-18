---
id: e0e37a7f-d12f-45b7-8495-2ee5e8f4c4a4
title: Implement Database Schema Update for Item Category
responsibleArea: Full-Stack Developer
---
Modify the PostgreSQL `CapturedItem` table to include a `category` column. This column will store the type of the item ('idea', 'task', or 'goal'). Update the corresponding ORM model (e.g., TypeORM entity) in the backend.

*   **Acceptance Criteria:**
    *   Add `category` column (e.g., `VARCHAR` or `ENUM`) to the `CapturedItem` table.
    *   Ensure appropriate constraints (e.g., `NOT NULL` with a default, or handle required status in application logic).
    *   Update backend entity/model to reflect the new `category` field.
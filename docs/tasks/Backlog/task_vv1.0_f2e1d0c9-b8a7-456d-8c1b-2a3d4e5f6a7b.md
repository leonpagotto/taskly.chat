---
id: f2e1d0c9-b8a7-456d-8c1b-2a3d4e5f6a7b
title: Design Database Schema for Captured Items
responsibleArea: Full-Stack Developer
---
Design the PostgreSQL database table to store captured ideas/tasks. This includes:
*   Table name (e.g., `captured_items`).
*   Essential columns: `id` (UUID, primary key), `user_id` (foreign key, for authentication), `text_content` (TEXT), `created_at` (TIMESTAMP with default NOW()).
*   Consideration for future fields (e.g., `status`, `type`) but keep it simple for MVP.
---
id: 713c77d4-e696-48f0-b9a3-a8019052d3a9
title: Develop Backend API Endpoint for Updating Item Category
responsibleArea: Full-Stack Developer
---
Implement or extend the existing API endpoint (e.g., `PUT /api/items/:id`) to allow updating the `category` field of a `CapturedItem`. This endpoint should accept the item ID and the new category value.

*   **Acceptance Criteria:**
    *   Endpoint successfully updates the `category` field for a given item ID.
    *   Validate the incoming `category` value against allowed types: 'idea', 'task', 'goal'.
    *   Return a `400 Bad Request` for invalid category values.
    *   Return a `404 Not Found` for non-existent item IDs.
    *   Return the updated `CapturedItem` object upon successful update.
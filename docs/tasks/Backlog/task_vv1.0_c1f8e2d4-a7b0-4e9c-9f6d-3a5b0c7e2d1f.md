---
id: c1f8e2d4-a7b0-4e9c-9f6d-3a5b0c7e2d1f
title: Implement Frontend Logic to Detect Complex Tasks and Trigger Suggestions
responsibleArea: Full-Stack Developer
---
Develop the React/TypeScript frontend logic to identify when a user's task input (title/description) appears complex enough to warrant breakdown suggestions. This includes:
*   **Input Monitoring:** Listen for changes in task title/description fields.
*   **Complexity Heuristics:** Implement simple frontend checks (e.g., title length exceeding X characters, presence of certain keywords) to trigger the suggestion process.
*   **API Call:** On detection, call the backend `/api/tasks/suggest-breakdown` endpoint with the current task details.
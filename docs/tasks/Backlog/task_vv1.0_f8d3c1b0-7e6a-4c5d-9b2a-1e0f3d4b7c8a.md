---
id: f8d3c1b0-7e6a-4c5d-9b2a-1e0f3d4b7c8a
title: Implement Backend API for Unstructured Note Structuring
responsibleArea: Full-Stack Developer
---
Develop the backend API endpoint and core logic for processing unstructured notes.
*   Create a new REST API endpoint (`/api/notes/suggest-tasks`) that accepts unstructured text.
*   Implement the initial suggestion engine based on the architectural design (e.g., identify keywords like 'due by', 'tomorrow', 'call', 'email' and potential task verbs).
*   Map extracted information (e.g., task title, due date, assignee) to the existing task data model.
*   Return a structured list of suggested tasks/subtasks to the frontend.
*   Write unit and integration tests for the new API and suggestion logic.
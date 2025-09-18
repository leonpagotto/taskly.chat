---
id: f5a6b7c8-d9e0-1f2a-3b4c-5d6e7f8a9b0c
title: 'Backend: Write Unit and Integration Tests for Priority'
responsibleArea: Full-Stack Developer
---
Develop unit tests for the updated task service logic and integration tests for the API endpoints related to task creation and updates, specifically verifying correct handling of the `priority` field. Test valid and invalid priority inputs.

*   **Acceptance Criteria:**
    *   Unit tests cover the logic for assigning and updating task priorities.
    *   Integration tests verify API behavior for `POST` and `PUT/PATCH` requests with `priority`.
    *   Tests include scenarios for valid 'High', 'Medium', 'Low' priorities and invalid priority strings.
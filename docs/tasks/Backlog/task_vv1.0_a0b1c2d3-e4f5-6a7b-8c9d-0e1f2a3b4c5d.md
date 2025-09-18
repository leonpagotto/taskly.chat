---
id: a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d
title: Backend API Unit and Integration Tests for Filtering
responsibleArea: QA Engineer
---
Write comprehensive unit and integration tests for the backend filtering logic implemented in the GET /tasks API endpoint. This ensures the filter functionality is robust and reliable.

### Acceptance Criteria:
*   Unit tests are created for the service/controller layer to verify correct database queries are generated based on context parameter.
*   Integration tests are developed to confirm the `/tasks` endpoint responds correctly when `context=personal`, `context=professional`, and without a `context` parameter.
*   Tests should cover edge cases, such as invalid context values or an empty task list.
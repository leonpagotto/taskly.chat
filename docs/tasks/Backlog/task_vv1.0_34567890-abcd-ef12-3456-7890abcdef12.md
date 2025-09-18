---
id: 34567890-abcd-ef12-3456-7890abcdef12
title: Frontend E2E Tests for Filter Functionality
responsibleArea: QA Engineer
---
Develop end-to-end tests to validate the complete user flow for filtering tasks by context in the frontend application. This will ensure the UI interaction correctly updates the displayed tasks via API calls.

### Acceptance Criteria:
*   An E2E test exists that navigates to the task list.
*   The test clicks the 'Personal' filter and verifies only 'personal' tasks are displayed.
*   The test clicks the 'Professional' filter and verifies only 'professional' tasks are displayed.
*   The test clicks the 'All' filter and verifies all tasks are displayed.
*   Tests should confirm that the correct API requests are made upon filter selection.
---
id: fedcba98-7654-3210-fedc-ba9876543210
title: Integrate Frontend Filter with Task List and API
responsibleArea: Full-Stack Developer
---
Modify the main task list component to incorporate the new filter UI. When a filter is selected, the frontend should make an updated API call to fetch tasks based on the chosen context and refresh the displayed list.

### Acceptance Criteria:
*   The filter UI component must be present and functional on the task list page.
*   Selecting a filter (e.g., 'Personal') must trigger an API call to GET /tasks?context=personal.
*   The task list must update dynamically to show only tasks matching the selected filter.
*   Switching back to 'All' should remove the context filter from the API request.
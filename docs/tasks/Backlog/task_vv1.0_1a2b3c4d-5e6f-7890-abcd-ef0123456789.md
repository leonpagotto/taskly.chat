---
id: 1a2b3c4d-5e6f-7890-abcd-ef0123456789
title: Integrate and display overdue/approaching tasks on the dashboard
responsibleArea: Full-Stack Developer
---
Develop a new section or widget on the user's dashboard to visually present tasks identified as overdue or approaching their due date.

*   **Acceptance Criteria:**
    *   Fetch data from the newly implemented `/api/v1/tasks/summary/urgent` endpoint.
    *   Display a clear visual distinction between "Overdue" and "Approaching" tasks (e.g., using different color highlights like red for overdue, orange/yellow for approaching).
    *   Each displayed task item should clearly show its `title`, `due_date`, and optionally a truncated `description`.
    *   Implement appropriate loading indicators while data is being fetched.
    *   Implement robust error handling and display user-friendly messages for API failures.
    *   Ensure the UI component is responsive and integrates seamlessly with the existing dashboard layout.
    *   For this MVP, no interactivity (e.g., mark as complete, edit) is required; pure display is sufficient.
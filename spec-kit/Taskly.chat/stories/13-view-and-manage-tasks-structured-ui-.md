## Story: View and Manage Tasks (Structured UI)

**Description:**
As a user, I want a dedicated, intuitive UI to view, edit, mark as complete, and delete all my captured tasks (simple reminders, recurring tasks, shopping list items), so I have a comprehensive and organized overview of my commitments outside of the conversational interface. This UI should allow filtering by type, due date, or status. For shopping lists, I should be able to mark individual items as 'bought'. For recurring tasks, I should be able to view their schedule and stop them. This UI should also allow me to create new tasks directly, bypassing the conversational interface.

### Tasks

- [ ] **Design Structured Task Management UI/UX** [UX/UI Designer]
  - Develop comprehensive wireframes and high-fidelity mockups for the dedicated task management user interface. This includes:
    *   **Task List View**: Layout for displaying all tasks with options for filtering (by type, due date, status) and sorting.
    *   **Task Detail/Edit View**: UI for viewing and modifying individual task properties, including 'mark as complete' functionality.
    *   **Create New Task Form**: Design for directly creating new simple, recurring, and shopping list tasks.
    *   **Specifics for Shopping Lists**: UI elements to mark individual items as 'bought'.
    *   **Specifics for Recurring Tasks**: UI to display recurrence patterns and a control to stop recurrence.
    *   Ensure a consistent and intuitive user experience aligned with Taskly.chat's overall design language.
- [ ] **Develop Backend API for Task Retrieval (List & Filter)** [Backend Engineer]
  - Create or extend NestJS/FastAPI endpoints to allow the frontend to retrieve a list of all user tasks. The API should support:
    *   Fetching all tasks associated with the authenticated user.
    *   Filtering tasks by `type` (e.g., 'simple', 'recurring', 'shoppingList').
    *   Filtering by `due_date` range.
    *   Filtering by `status` (e.g., 'pending', 'completed').
    *   Pagination and sorting capabilities.
    *   Ensure efficient database queries using PostgreSQL for optimal performance.
- [ ] **Develop Backend API for Task Creation** [Backend Engineer]
  - Implement or extend NestJS/FastAPI endpoints to enable the creation of new tasks directly via the structured UI.
    *   Support creating 'simple' tasks with title, description, and due date.
    *   Support creating 'recurring' tasks with title, description, start date, and recurrence pattern.
    *   Support creating 'shopping list' tasks with a title and an initial list of items.
    *   Perform input validation and associate tasks with the authenticated user.
- [ ] **Develop Backend API for Task Update** [Backend Engineer]
  - Create or extend NestJS/FastAPI endpoints to allow comprehensive updates to existing tasks:
    *   General task updates: Modify title, description, due date for any task type.
    *   Status updates: Mark any task as 'complete' or 'incomplete'.
    *   Shopping list item updates: Allow marking individual items within a shopping list as 'bought' or 'not bought'.
    *   Recurring task management: Update the recurrence pattern or 'stop' the recurrence entirely.
    *   Ensure data integrity and proper authorization for updates.
- [ ] **Develop Backend API for Task Deletion** [Backend Engineer]
  - Implement or extend NestJS/FastAPI endpoints to allow users to delete tasks.
    *   Soft delete tasks by updating an `is_deleted` flag in the database.
    *   Ensure proper authorization, allowing only the task owner to delete their tasks.
- [ ] **Implement Frontend Task List Component** [Frontend Engineer]
  - Develop the React/Next.js component for displaying a user's task list based on the UX/UI design.
    *   Fetch tasks from the backend API, incorporating filtering and sorting parameters.
    *   Render tasks clearly, showing relevant details like title, due date, and status.
    *   Implement interactive UI for filtering by task type, due date, and completion status.
    *   Provide UI elements for quick actions like marking complete or navigating to task details.
- [ ] **Implement Frontend Task Detail and Edit Component** [Frontend Engineer]
  - Build the React/Next.js component for viewing and editing individual tasks.
    *   Display all details of a selected task.
    *   Provide input fields and controls for editing task properties (title, description, due date).
    *   Integrate a toggle or button to mark tasks as complete/incomplete, updating the backend.
    *   For shopping lists: Implement checkboxes or similar controls for marking individual items as 'bought'.
    *   For recurring tasks: Display the recurrence schedule and provide a button to 'stop recurrence', updating the backend.
- [ ] **Implement Frontend Create New Task Form** [Frontend Engineer]
  - Develop the React/Next.js form that allows users to create new tasks directly, bypassing the conversational interface.
    *   Provide an option to select the task type (Simple, Recurring, Shopping List).
    *   Dynamically render appropriate input fields based on the selected task type (e.g., recurrence pattern for recurring tasks, a list builder for shopping list items).
    *   Handle form submission, sending the new task data to the backend API.
- [ ] **Integrate Task Management UI into Taskly.chat Platform** [Frontend Engineer]
  - Integrate all developed frontend components for task management (list, detail, create) into the main Taskly.chat Next.js application.
    *   Set up proper routing for the task management section.
    *   Ensure seamless navigation between the task management UI and other parts of the application.
    *   Implement error handling and loading states for API interactions.
    *   Ensure responsive design across various screen sizes.
- [ ] **Database Schema and ORM Updates for Task Management** [Backend Engineer]
  - Design and implement necessary updates to the PostgreSQL database schema and associated ORM models (via TypeORM in NestJS and SQLAlchemy in FastAPI for shared entities if applicable).
    *   Define or update `Task` table to include fields for `type`, `status`, `dueDate`, `recurrencePattern`, `shoppingListItems` (or a related table).
    *   Ensure fields are correctly typed and indexed for efficient querying.
    *   Manage database migrations to apply schema changes without data loss.
    *   Ensure consistency across all task data, including those captured via the conversational interface.
- [ ] **Define Detailed Requirements for Task Management UI** [Product Manager]
  - Elaborate on the user story 'View and Manage Tasks (Structured UI)' to create detailed functional and non-functional requirements.
    *   **Functional**: Specify exact filters, sorting options, editing capabilities, and interactions for each task type.
    *   **Acceptance Criteria**: Define clear, measurable conditions for each feature (e.g., 'User can filter tasks by due date range', 'Shopping list items can be individually marked as bought').
    *   **Edge Cases**: Document behavior for scenarios like empty task lists, invalid inputs, and API errors.
    *   **Performance**: Outline expectations for load times and responsiveness of the UI.
    *   Coordinate with UX/UI Designer, Frontend Engineer, and Backend Engineer to ensure requirements are clear and feasible.

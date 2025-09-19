## Story: Capture Recurring Task via Conversation

**Description:**
As a user, I want to define a recurring task using natural language (e.g., 'Remind me to water plants every Sunday'), so Taskly.chat automatically schedules it to repeat at the specified interval and reminds me accordingly. The recurring task should be visible in the dedicated structured UI and appear in my integrated calendar/email on its scheduled dates. Taskly.chat should confirm the recurring schedule and allow for future modifications via the structured UI or conversational prompts. It should also ask for the end date if the recurring task is for a limited period, otherwise, it should be considered as ongoing. If the user mentions 'every Sunday', it will be ongoing, and will continue until the user explicitly stops it via the structured UI. If the user says 'every Sunday for next 3 months', it should set an end date for 3 months later. If the user says 'every Tuesday and Thursday', it should create a recurring task for both days of the week.

### Tasks

- [ ] **Develop NLU for Recurring Task Intent and Entity Extraction** [AI/NLP Engineer]
  - Implement and fine-tune NLP models to accurately identify user intent for creating a recurring task. This includes extracting key entities such as:
    *   Task name (e.g., 'water plants')
    *   Recurrence pattern (e.g., 'every Sunday', 'daily', 'every Tuesday and Thursday', 'every other week')
    *   Optional start date/time (if specified, otherwise default to 'now')
    *   Optional duration or explicit end date (e.g., 'for next 3 months', 'until December 31st')
- [ ] **Implement Conversational Flow for Recurring Task Confirmation and End Date Clarification** [AI/NLP Engineer]
  - Develop AI conversational logic to:
    *   Confirm the parsed recurring schedule with the user after initial input (e.g., 'Got it, 'Water plants' every Sunday, ongoing. Does that sound right?').
    *   Prompt the user for an end date if one is not specified and the task is identified as potentially having a limited duration (e.g., if a user says 'Remind me to do X every Monday' without an end date, the system could ask 'Should this be ongoing, or for a limited period?').
    *   Handle user responses to clarification questions.
- [ ] **Design and Implement Database Schema for Recurring Tasks** [Backend Engineer]
  - Create a new or extend the existing PostgreSQL database schema to store recurring task definitions. The schema should include fields for:
    *   `id` (UUID)
    *   `user_id`
    *   `title`
    *   `description` (optional)
    *   `start_date` (first instance date)
    *   `recurrence_rule` (e.g., using a custom JSON format to define frequency, interval, days of week/month, etc.)
    *   `end_date` (optional, for limited recurring tasks)
    *   `is_ongoing` (boolean, true if no end_date)
    *   `created_at`, `updated_at`
- [ ] **Develop API Endpoints for Recurring Task Management** [Backend Engineer]
  - Create NestJS API endpoints to:
    *   `POST /recurring-tasks`: Receive parsed recurring task data from the AI service and persist it to the database.
    *   `GET /recurring-tasks`: Retrieve a list of all recurring tasks for a user.
    *   `GET /recurring-tasks/{id}`: Retrieve details of a specific recurring task.
    *   `PUT /recurring-tasks/{id}`: Update an existing recurring task's definition (e.g., change recurrence rule, end date, title).
    *   `DELETE /recurring-tasks/{id}`: Mark a recurring task as inactive or delete it.
- [ ] **Implement Recurring Task Instance Generation and Scheduling Service** [Backend Engineer]
  - Develop a backend service (e.g., a scheduled job or microservice) that:
    *   Reads active recurring task definitions from the database.
    *   Generates future task instances based on their `recurrence_rule` up to a certain look-ahead period (e.g., next 3 months).
    *   Stores these generated instances as individual tasks in the main task management system, linking them back to their recurring parent.
    *   Handles updates to recurring task definitions by adjusting/regenerating future instances.
- [ ] **Integrate Google Calendar API for Recurring Task Instances** [Backend Engineer]
  - Extend the existing Google Calendar integration to:
    *   Create new calendar events for *each generated instance* of a recurring task.
    *   Update existing calendar events when a recurring task definition changes or an instance is modified/deleted.
    *   Ensure proper synchronization and handling of event IDs for tracking.
- [ ] **Integrate Email Service for Recurring Task Reminders** [Backend Engineer]
  - Extend the existing email reminder system to:
    *   Send email notifications for scheduled instances of recurring tasks based on user preferences.
    *   Include relevant task details and links to Taskly.chat for further action.
- [ ] **Develop UI for Displaying Recurring Tasks** [Frontend Engineer]
  - Create a new section or enhance an existing one within the dedicated structured UI (React with Next.js) to:
    *   Fetch and display a list of active recurring tasks using the new backend API.
    *   Show key details for each recurring task (title, recurrence pattern, ongoing/end date).
    *   Provide a clear visual indication of whether a task is recurring versus a one-off task.
- [ ] **Develop UI for Modifying/Stopping Recurring Tasks** [Frontend Engineer]
  - Implement functionality in the structured UI to:
    *   Allow users to select a recurring task and view its full details.
    *   Provide input fields/controls to modify the task title, recurrence rule, and end date.
    *   Include an option to 'Stop' or 'Delete' an ongoing recurring task, which should update its `end_date` or mark it inactive via the backend API.
    *   Implement client-side validation for modifications.
- [ ] **Integrate Lobe-chat with Backend for Recurring Task Capture** [Frontend Engineer]
  - Configure and extend the Lobe-chat interface to:
    *   Send the parsed recurring task data (from the AI/NLP component) to the appropriate backend API endpoint (`POST /recurring-tasks`).
    *   Display conversational confirmations and clarification prompts received from the AI.
    *   Handle success/failure messages from the backend for task creation.
- [ ] **Design User Experience for Recurring Task Management** [UX/UI Designer]
  - Create comprehensive UI/UX designs for the recurring task features, including:
    *   Wireframes and mockups for the recurring task list view.
    *   Detailed designs for the recurring task detail/edit view, including controls for recurrence patterns (e.g., daily, weekly on specific days, monthly), start/end dates, and an 'ongoing' toggle.
    *   Interaction flows for creating, modifying, and stopping recurring tasks through the structured UI.
    *   Visual feedback for successful task creation/modification.

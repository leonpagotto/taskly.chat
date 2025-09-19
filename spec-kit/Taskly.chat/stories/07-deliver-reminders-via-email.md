## Story: Deliver Reminders via Email

**Description:**
As a user with email integration enabled, I want Taskly.chat to send me email notifications for my scheduled reminders and upcoming tasks, so I receive timely alerts in my primary inbox. The emails should be clear, concise, and include the task title, description, and due date/time. The email sender should be clearly identifiable as Taskly.chat. If the reminder is time-sensitive, the email should be sent at the scheduled time. If it is an all-day reminder, the email should be sent at a configurable time on the day of the reminder (e.g., 9 AM).

### Tasks

- [ ] **Design Email Notification Layout** [UX/UI Designer]
  - Create a clear and concise email template for reminder notifications, including placeholders for task title, description, and due date/time. Ensure consistent Taskly.chat branding and sender identification.
    *   **Acceptance Criteria:**
        *   Layout is responsive and readable on various email clients.
        *   Includes a clear "From: Taskly.chat" or similar identifier.
        *   Placeholders for `task.title`, `task.description`, `task.dueDate`, `task.dueTime`.
        *   Professional and non-intrusive aesthetic.
- [ ] **Implement Email Service Provider Integration** [Backend Engineer]
  - Integrate a transactional email service (e.g., AWS SES) into the Node.js NestJS core services. This involves setting up credentials, configuring the sending domain, and creating a robust email sending utility that can be called by other services.
    *   **Acceptance Criteria:**
        *   Successfully send test emails programmatically.
        *   Email sender address is configurable and identifiable as Taskly.chat.
        *   Error handling for failed email sends is implemented.
        *   Utilizes environment variables for sensitive credentials.
- [ ] **Develop User Email Preferences API and Database Schema** [Backend Engineer]
  - Create the necessary PostgreSQL database schema to store user-specific email notification preferences. Implement RESTful API endpoints (NestJS) for users to retrieve, enable/disable email notifications, and configure their preferred time for all-day reminder emails (e.g., 9 AM by default).
    *   **Acceptance Criteria:**
        *   Database table `user_preferences` includes fields like `email_notifications_enabled` (boolean) and `all_day_reminder_time` (time or string).
        *   GET `/api/user/preferences/email` returns current settings.
        *   PUT `/api/user/preferences/email` updates settings, with validation.
        *   Default `all_day_reminder_time` is set to 9:00 AM if not specified.
- [ ] **Implement Dynamic Email Content Generation Logic** [Backend Engineer]
  - Develop a service function within the NestJS backend responsible for generating the actual HTML or plain text email body for a given reminder. This function will take a task object and the designed email template, populate it with the task's title, description, and formatted due date/time.
    *   **Acceptance Criteria:**
        *   Function `generateReminderEmailBody(task)` produces correctly formatted email content.
        *   Task title, description, and due date/time are accurately rendered.
        *   Handles cases where description might be long or empty.
        *   Dates and times are presented in a user-friendly format (e.g., "YYYY-MM-DD at HH:MM").
- [ ] **Build Reminder Dispatcher Service with Scheduling Logic** [Backend Engineer]
  - Develop a robust background service or scheduled job (e.g., using a cron-like mechanism or SQS/Lambda) that periodically checks for upcoming and due reminders for all users.
    *   **Acceptance Criteria:**
        *   Identifies reminders that are due now or within a configured window.
        *   Retrieves user email notification preferences.
        *   For time-sensitive reminders: dispatches email at the exact scheduled time.
        *   For all-day reminders: dispatches email at the user's configured `all_day_reminder_time` on the reminder's day.
        *   Calls the email sending utility with the generated email content.
        *   Logs successful and failed email dispatches.
        *   Utilizes messaging queues (SQS) for reliable dispatching.
- [ ] **Develop Frontend UI for Email Notification Settings** [Frontend Engineer]
  - Implement the user interface within the React/Next.js structured task management application to allow users to manage their email notification preferences. This includes:
    *   A toggle switch to enable/disable all email reminders.
    *   A time picker input for configuring the all-day reminder delivery time.
    *   Integration with the `/api/user/preferences/email` API endpoints to fetch and save user settings.
    *   Visual feedback for successful saves or errors.

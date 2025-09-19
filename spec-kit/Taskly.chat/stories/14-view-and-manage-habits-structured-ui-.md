## Story: View and Manage Habits (Structured UI)

**Description:**
As a user, I want a dedicated, visual UI to view my tracked habits, monitor my progress over time (e.g., streaks, completion rates), and manually update my habit status, so I can effectively manage and reinforce my personal routines. This UI should allow me to add new habits, edit existing ones, and view historical data for each habit. For example, I should be able to see a calendar view showing when I completed a habit, or a graph showing my consistency. I should also be able to manually mark a habit as complete for a specific day if I forgot to do so via conversation. If I want to stop tracking a habit, I should be able to do it here, and it will be removed from the habit tracker.

### Tasks

- [ ] **Design Habit Management Structured UI** [UX/UI Designer]
  - Create wireframes and mockups for the dedicated habit management user interface within Taskly.chat's web platform. This includes:
    *   **Habit List View:** Displaying all tracked habits with a summary (e.g., name, current streak).
    *   **Habit Detail View:** A comprehensive view for a single habit, incorporating:
        *   Progress metrics (current streak, longest streak, completion rate).
        *   A calendar view to visualize daily completion status.
        *   A simple consistency graph over time.
    *   **Add Habit Form:** UI for creating new habits (name, description, frequency, start date).
    *   **Edit Habit Form:** UI for modifying existing habit details.
    *   **Interaction Design:** Elements for manually marking habits as complete for specific days, and options for deleting/archiving habits with confirmation.
- [ ] **Design and Implement Habit Database Schema** [Backend Engineer]
  - Define and implement the necessary PostgreSQL database schema to support habit tracking. This involves:
    *   `habits` table: Stores core habit definitions (e.g., `id`, `user_id`, `name`, `description`, `frequency_type` (e.g., daily, weekly), `frequency_details` (e.g., 'Mon,Wed,Fri' or day of month), `start_date`, `end_date` (optional), `is_active`).
    *   `habit_completions` table: Records daily completion status for each habit (`id`, `habit_id`, `completion_date`, `status` (e.g., 'completed', 'skipped', 'missed', 'pending')).
- [ ] **Develop Habit CRUD APIs** [Backend Engineer]
  - Implement the RESTful API endpoints using NestJS for creating, retrieving, updating, and deleting habits:
    *   `POST /api/habits`: Create a new habit for the authenticated user.
    *   `GET /api/habits`: Retrieve a list of all active habits for the user, possibly including summarized progress data.
    *   `GET /api/habits/{id}`: Fetch detailed information for a specific habit, including its definition and relevant historical completion data.
    *   `PUT /api/habits/{id}`: Update an existing habit's details (e.g., name, description, frequency).
    *   `DELETE /api/habits/{id}`: Mark a habit as inactive (soft delete) to stop tracking it.
- [ ] **Develop Habit Completion Management API** [Backend Engineer]
  - Implement API endpoints to manage the completion status of habits for specific dates:
    *   `POST /api/habits/{id}/completions`: Mark a habit as complete, skipped, or missed for a given date. This should handle both initial marking and updating an existing entry.
    *   The API should allow updating the status for past dates, enabling users to manually correct or input forgotten completions.
- [ ] **Implement Habit Progress Calculation Logic** [Backend Engineer]
  - Develop backend services or utility functions to calculate and provide habit progress metrics, exposed via the habit detail API (`GET /api/habits/{id}`):
    *   **Current Streak:** Number of consecutive successful days/periods.
    *   **Longest Streak:** The maximum consecutive successful period achieved.
    *   **Completion Rate:** Percentage of successful completions over a specified period (e.g., last 30 days, all time).
    *   Provide historical completion data structured for easy consumption by frontend calendar and graph components.
- [ ] **Create Habit Management Page and Routing** [Frontend Engineer]
  - Set up the primary React/Next.js page for habit management, including:
    *   Define the `/habits` route in Next.js.
    *   Implement the main layout container for the habit management section.
    *   Integrate global state management (if applicable) to handle habit data across components.
- [ ] **Develop Habit List Component** [Frontend Engineer]
  - Build a React component to display a list of habits:
    *   Fetch the user's active habits from the `/api/habits` endpoint.
    *   Render each habit in an easily digestible format, including its name and a summary of its current status (e.g., current streak).
    *   Implement navigation links from each list item to its detailed habit view page.
- [ ] **Develop Habit Detail View Components** [Frontend Engineer]
  - Create a comprehensive React component for viewing a single habit's details:
    *   Fetch specific habit data and historical completions from `/api/habits/{id}`.
    *   Display habit name, description, and frequency.
    *   Implement components for showing calculated progress metrics: current streak, longest streak, and completion rate.
    *   Develop an interactive calendar component that visualizes daily completion status (e.g., color-coded cells for completed, skipped, missed).
    *   Implement a simple graph component (e.g., bar or line chart) to show consistency over a chosen time range.
    *   Allow users to manually update the completion status for specific days directly from the calendar view, integrating with the completion API.
- [ ] **Develop Add/Edit Habit Forms** [Frontend Engineer]
  - Build dedicated React forms for creating new habits and editing existing ones:
    *   Form fields should include habit name, description, frequency (e.g., daily, specific days of the week), and start date.
    *   Implement client-side validation for form inputs.
    *   Integrate with the `POST /api/habits` and `PUT /api/habits/{id}` APIs for submission.
    *   Provide clear success/error feedback to the user.
- [ ] **Implement Habit Deletion/Archiving Functionality** [Frontend Engineer]
  - Add user interface elements and corresponding logic to allow users to stop tracking a habit:
    *   Include a 'Delete' or 'Archive' button on the habit detail page.
    *   Implement a confirmation modal to prevent accidental deletion.
    *   Integrate with the `DELETE /api/habits/{id}` API endpoint.
- [ ] **Define Detailed Habit Tracking Requirements and Prioritization** [Product Manager]
  - Elaborate on specific requirements and prioritize features for the habit tracking UI:
    *   **Metric Definitions:** Clearly define how streaks (current, longest) and completion rates (e.g., 7-day, 30-day, all-time) should be calculated and displayed.
    *   **Calendar View:** Specify exact behaviors and visual cues for the calendar (e.g., color-coding for different statuses, selectable dates for manual updates).
    *   **Graph Requirements:** Detail the type of graph (e.g., line, bar), data points, and time ranges expected (e.g., last 30 days, current month).
    *   **User Flows:** Outline ideal user flows for adding, editing, completing, and deleting habits.

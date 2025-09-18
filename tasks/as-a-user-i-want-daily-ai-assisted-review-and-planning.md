## Story: As a user, I want daily AI-assisted review and planning

**Description:**
As a user, I want Taskly.chat to offer a daily AI-assisted review of my progress and suggest a plan for the day, helping me prioritize and focus on what matters most.

### Tasks

- [ ] **Implement daily AI review scheduling and trigger mechanism** [Backend Engineer]
  - Develop a robust backend service to schedule and trigger the daily AI review process for each user.
    * Implement a cron-like job or message queue based scheduler.
    * Allow configuration of the daily review time per user.
    * Trigger an event/function that initiates data collection for the AI.
- [ ] **Develop API for retrieving daily review context data** [Backend Engineer]
  - Create a new API endpoint or extend existing ones to gather all necessary data for the AI's daily review and planning.
    * Retrieve completed tasks from the previous day/week for a specific user.
    * Retrieve uncompleted tasks, upcoming deadlines, and project goals.
    * Include user-specific preferences related to review scope (e.g., focus areas).
- [ ] **Design and implement AI prompt for daily review and planning** [Lead AI/ML Engineer]
  - Develop and refine the LLM prompt engineering to generate a daily review and planning suggestion.
    * Craft a prompt that takes user activity data (completed tasks, upcoming tasks, goals) as input.
    * Instruct the AI to summarize progress, identify blockers/dependencies, and suggest prioritized tasks for the day.
    * Define response format (e.g., JSON structure, markdown text) for easy parsing by the frontend.
- [ ] **Implement AI response parsing for daily plan suggestions** [Lead AI/ML Engineer]
  - Develop backend logic to parse and structure the AI's daily review and planning response.
    * Validate the AI response against the expected format.
    * Extract suggested tasks, priorities, and any identified insights.
    * Handle cases where the AI response might be malformed or incomplete.
- [ ] **Build conversational UI for daily AI review and planning** [Frontend/Conversational UI Developer]
  - Create a dedicated section or conversational flow for presenting the daily AI-assisted review and planning.
    * Display the AI's summary of progress and suggested plan clearly.
    * Allow users to interact with suggestions (e.g., mark tasks as done, add to today, re-prioritize).
    * Ensure responsiveness across web and mobile platforms.
    * Integrate with existing conversational UI components.
- [ ] **Develop UI for daily review settings and preferences** [Frontend/Conversational UI Developer]
  - Implement user interface elements that allow users to configure their daily AI review experience.
    * Enable/disable the daily review feature.
    * Select preferred time for receiving the daily review.
    * Define scope or focus areas for the AI (e.g., "focus on work tasks", "include personal errands").
- [ ] **Implement backend for daily review user preferences** [Backend Engineer]
  - Create or extend API endpoints and database schema to store user preferences for the daily AI review.
    * Store `isEnabled` flag, `preferredTime`, and `focusAreas` for each user.
    * Ensure these preferences are accessible by the scheduling and AI processing services.
- [ ] **Develop and execute E2E tests for daily AI review and planning** [QA Engineer]
  - Create comprehensive test plans and execute end-to-end tests for the entire daily AI review workflow.
    * Verify scheduled triggers fire correctly.
    * Validate data retrieval for AI context.
    * Assess the quality and relevance of AI-generated reviews and plans.
    * Test user interaction with suggested plans (accepting, modifying, declining).
    * Ensure user preferences are correctly applied and persisted.
    * Perform performance and reliability testing for the scheduling and AI processing.

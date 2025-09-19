## Story: Update Habit Tracking via Conversation

**Description:**
As a user, I want to update my progress for a tracked habit using natural language (e.g., 'I meditated today' or 'Mark my exercise habit as complete'), so Taskly.chat records the update in my habit tracking history. The update should be reflected in the dedicated habit management UI. Taskly.chat should recognize various phrases for completion and apply them to the correct habit. If the habit is not recognized, it should ask the user to specify which habit they want to update, and also suggest creating a new habit if one is not present. If a new habit is created, it will be added to the habit tracking UI for future updates and tracking.

### Tasks

- [ ] **Design and Implement NLU for Habit Update Intent** [AI/NLP Engineer]
  - Design and train a natural language understanding (NLU) model to accurately recognize user intent for habit updates from conversational input. The model should also be capable of extracting specific entities such as the habit name and any implicit or explicit time indicators (e.g., "today", "yesterday").
    *   **Acceptance Criteria:**
        *   Model reliably identifies phrases indicating a habit update (e.g., "I finished my daily run", "Mark yoga as done").
        *   Successfully extracts the habit's name from various phrasing.
        *   Achieves a predefined accuracy threshold (e.g., 90%) on test data for intent recognition and entity extraction.
- [ ] **Develop Backend API for Habit Tracking and Update** [Backend Engineer]
  - Implement a FastAPI/NestJS endpoint to handle habit update requests. This endpoint will receive the habit identifier (or name) and user ID, then record a new entry in the user's `habit_history` in PostgreSQL. Ensure data validation and proper error handling.
    *   **Acceptance Criteria:**
        *   A `POST /api/habits/{habitId}/updates` (or similar) endpoint is functional.
        *   Successfully records habit completion events, including timestamp, user ID, and habit ID.
        *   Handles updates for non-existent habit IDs gracefully (e.g., returning a 404 or specific error code).
        *   Integration with PostgreSQL database is robust.
- [ ] **Implement Conversational Logic for Habit Update and Disambiguation** [AI/NLP Engineer]
  - Develop the LangChain-based conversational orchestration logic to process NLU output for habit updates. This logic will determine if a habit is clearly identified. If no clear habit is found or multiple habits match, the system should generate clarifying questions to the user. Integrate with the backend APIs for searching habits and creating new ones.
    *   **Acceptance Criteria:**
        *   Successfully routes NLU-identified habits to the update API.
        *   Generates appropriate follow-up questions when a habit is ambiguous or unknown.
        *   Maintains conversational context to act on user clarifications (e.g., "Yes, that one").
- [ ] **Implement Backend API for Habit Search and Creation** [Backend Engineer]
  - Create FastAPI/NestJS endpoints to facilitate searching for habits by name (potentially fuzzy search) and creating new habits for a user. These endpoints will be used by the conversational logic for disambiguation and new habit onboarding.
    *   **Acceptance Criteria:**
        *   A `GET /api/habits/search?query={searchTerm}` endpoint returns a list of matching habits.
        *   A `POST /api/habits` endpoint allows creation of a new habit with a name and user ID.
        *   Ensures unique habit names per user or handles duplicates gracefully.
        *   All new habits are correctly stored in the PostgreSQL database.
- [ ] **Update Dedicated Habit Management UI for Progress Display** [Frontend Engineer]
  - Modify the React/Next.js dedicated habit management UI to fetch and visually represent the latest habit tracking data, including new completions and history. This includes displaying the current status of a habit (e.g., marked as complete for today) and potentially a historical view.
    *   **Acceptance Criteria:**
        *   The habit list or individual habit cards in the UI reflect updates made via conversation almost instantaneously (upon refresh or polling).
        *   Users can view the history of their habit completions for any tracked habit.
        *   New habits created via conversation appear correctly in the UI.
- [ ] **Design UX for Conversational Habit Disambiguation and Creation** [UX/UI Designer]
  - Design the user experience for interacting with Taskly.chat when a habit update is ambiguous or a new habit needs to be created. This includes formulating clear conversational prompts, suggesting quick replies or buttons (if Lobe-chat allows), and outlining the flow for confirming new habit creation.
    *   **Acceptance Criteria:**
        *   Wireframes or mockups of conversational prompts for:
            *   Asking for clarification on ambiguous habits.
            *   Suggesting to create a new habit.
            *   Confirming a new habit name.
        *   Flowcharts detailing the conversational path for these scenarios.
        *   Ensures a consistent and intuitive user experience within Lobe-chat.
- [ ] **Integrate Conversational Responses into Lobe-chat UI** [Frontend Engineer]
  - Configure the Lobe-chat frontend to correctly display the AI's responses, including standard text replies, and interactive elements for disambiguation (e.g., buttons for selecting a habit) or new habit creation confirmation. Ensure user input through these interactive elements is correctly sent back to the AI/NLP service.
    *   **Acceptance Criteria:**
        *   Lobe-chat accurately renders all types of AI responses generated by the conversational logic.
        *   Interactive components (if supported by Lobe-chat and designed by UX) are functional and send appropriate payloads to the backend.
        *   Seamless user experience within the conversational interface for habit updates.

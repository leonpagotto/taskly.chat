## Story: As a user, I want to create tasks using natural language

**Description:**
As a user, I want to be able to input tasks using natural language descriptions (text or voice) so that the AI can understand and create a structured task for me, including identifying due dates, priorities, and related context.

### Tasks

- [ ] **Implement Natural Language Text Input UI** [Frontend/Conversational UI Developer]
  - Develop the user interface component allowing users to type natural language task descriptions.
    
    *   **Acceptance Criteria:**
        *   A text input field is visible and interactive.
        *   Users can type multi-line input.
        *   A submit button/action is available to send the input.
        *   Basic input validation (e.g., not empty) is performed client-side.
- [ ] **Integrate Voice Input for Task Creation** [Frontend/Conversational UI Developer]
  - Implement the functionality for users to speak their task descriptions, leveraging the Web Speech API (for browser) or a cloud-based Speech-to-Text service.
    
    *   **Acceptance Criteria:**
        *   A microphone icon/button is available in the UI.
        *   Clicking the button activates voice input.
        *   Spoken words are converted to text and displayed in the input field.
        *   Voice input session can be started and stopped.
        *   Error handling for microphone access or STT failures is implemented.
- [ ] **Create Frontend Service for Submitting Natural Language Tasks** [Frontend/Conversational UI Developer]
  - Develop the client-side service to send the natural language text (from either text or voice input) to the backend API.
    
    *   **Acceptance Criteria:**
        *   A function exists to take raw text input and send it to a designated backend endpoint.
        *   Handles loading states during API calls.
        *   Displays success or error messages to the user based on API response.
- [ ] **Display Structured Task Details on UI** [Frontend/Conversational UI Developer]
  - Implement the UI components to clearly present the structured task (title, description, due date, priority, context) after it has been created by the AI.
    
    *   **Acceptance Criteria:**
        *   Upon successful task creation, the newly created task's details are displayed.
        *   Task title, description, due date, and priority are clearly labeled and formatted.
        *   Contextual information is presented in an understandable way (e.g., related projects/tags).
        *   The display is responsive and user-friendly.
- [ ] **Design and Implement Task Database Schema Extensions** [Backend Engineer]
  - Extend the PostgreSQL database schema to accommodate detailed task attributes identified by the AI, such as priority, due date, and contextual tags.
    
    *   **Acceptance Criteria:**
        *   `tasks` table includes fields for `title`, `description`, `due_date` (nullable timestamp), `priority` (enum/integer), and a flexible `context` field (e.g., JSONB or separate tags table).
        *   Appropriate indices are added for performance.
        *   Schema migrations are written and tested.
- [ ] **Create API Endpoint for Natural Language Task Processing** [Backend Engineer]
  - Develop a new API endpoint that accepts natural language text, dispatches it to the AI service for parsing, and then persists the structured task in the database.
    
    *   **Acceptance Criteria:**
        *   POST `/api/tasks/from-natural-language` endpoint is implemented.
        *   Endpoint accepts a JSON body with a `text` field.
        *   Endpoint authenticates the user making the request.
        *   On success, returns the newly created structured task object.
        *   Handles errors from AI service or database.
- [ ] **Implement Core Task Persistence Logic** [Backend Engineer]
  - Develop the backend logic responsible for saving the structured task data (after AI processing) into the PostgreSQL database.
    
    *   **Acceptance Criteria:**
        *   A service layer function exists to take a structured task object and save it.
        *   Handles relationships (e.g., linking task to a user).
        *   Ensures data integrity and validation before saving.
        *   Returns the saved task object, including its ID.
- [ ] **Develop AI Service Wrapper for LLM Integration** [Lead AI/ML Engineer]
  - Create a flexible Python service or module that acts as an abstraction layer for interacting with external LLM APIs (initially OpenAI), allowing for easy switching or integration of other models.
    
    *   **Acceptance Criteria:**
        *   A generic interface (e.g., a Python class) for `LLMProvider` is defined.
        *   An implementation for `OpenAILLMProvider` is created, making calls to the OpenAI API.
        *   Handles API keys securely (e.g., environment variables).
        *   Provides methods for sending text and receiving responses.
        *   Error handling for API failures and rate limits.
- [ ] **Design and Implement LLM Prompt for Task Extraction** [Lead AI/ML Engineer]
  - Craft and refine the prompt engineering for the chosen LLM to accurately extract task title, detailed description, due date (and time), priority (e.g., high, medium, low), and any relevant context from natural language input.
    
    *   **Acceptance Criteria:**
        *   A robust prompt template is created that instructs the LLM to output structured JSON.
        *   The JSON output includes fields like `title`, `description`, `dueDate` (ISO format), `priority` (standardized enum), and `context` (e.g., array of tags or related project name).
        *   Examples are provided in the prompt for few-shot learning.
        *   Prompt is parameterized to accept user input.
- [ ] **Implement Natural Language Task Parsing Logic** [Lead AI/ML Engineer]
  - Develop the logic to call the LLM service with the designed prompt and parse its JSON output into a structured task object that can be saved in the database.
    
    *   **Acceptance Criteria:**
        *   A function or method exists to receive raw text.
        *   It calls the `LLMProvider` with the task extraction prompt.
        *   It parses the LLM's JSON response, validating its structure.
        *   It maps the parsed data to the internal `Task` data model.
        *   Includes robust error handling for malformed LLM responses or parsing issues.
- [ ] **Develop E2E Test Plan for Natural Language Task Creation** [QA Engineer]
  - Create a comprehensive test plan outlining scenarios for testing the natural language task creation feature from end-to-end, covering both text and voice input.
    
    *   **Acceptance Criteria:**
        *   Test cases for various natural language inputs (e.g., "Buy groceries tomorrow morning", "Schedule meeting with John for next Friday at 3 PM, important", "Write report").
        *   Test cases covering edge cases (e.g., ambiguous dates, no explicit priority, very short input).
        *   Verification steps for UI, API, database persistence, and AI extraction accuracy.
        *   Includes negative test cases (e.g., invalid input, no internet).
- [ ] **Execute E2E Tests for Natural Language Task Creation (Text Input)** [QA Engineer]
  - Perform end-to-end testing for task creation using natural language text input, following the developed test plan.
    
    *   **Acceptance Criteria:**
        *   All text-based test cases from the plan are executed.
        *   Bugs are reported with clear reproduction steps and expected vs. actual results.
        *   Functionality is verified across different browsers/devices if applicable.
- [ ] **Execute E2E Tests for Natural Language Task Creation (Voice Input)** [QA Engineer]
  - Perform end-to-end testing for task creation using natural language voice input, including verification of speech-to-text accuracy and subsequent task parsing.
    
    *   **Acceptance Criteria:**
        *   All voice-based test cases from the plan are executed.
        *   STT accuracy is within acceptable limits.
        *   Bugs related to voice input, STT, or AI parsing from voice input are reported.
        *   Functionality is verified across different browsers/devices/microphones if applicable.

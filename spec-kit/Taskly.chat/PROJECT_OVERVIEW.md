# Project: Taskly.chat (v1.0.0)

**Description:** build an MVP plan for the application that is referred in the connected github repository

Further clarifications:
- Given the extensive list of features, what are the absolute essential 2-3 core functionalities (e.g., conversational task capture, persistent memory, a specific type of automation like reminders) that must be present in the MVP to validate the core 'AI assistant' concept?
  - conversational task capture, persistent memory, a specific type of automation like reminders
- Are there any specific technical constraints, preferred LLM models, or mandatory third-party integrations (e.g., calendar, email) that must be included in the MVP?
  - Use Lobe-chat open-source to speed up the production (https://github.com/lobehub/lobe-chat)

---

# Specification

## Summary
Taskly.chat is an AI-powered personal assistant designed to be a central hub for life and work, blending conversation, persistent memory, and smart automations. Unlike traditional productivity tools, it aims to capture intent and organize actions through natural language interaction, acting as a companion that turns thoughts and goals into structured actions without rigid workflows. The MVP will focus on conversational task capture for simple date-based reminders, recurring tasks, shopping list items, and habit tracking updates, with initial integrations planned for Google Calendar and email for reminder delivery and task capture, alongside providing weather updates for enhanced context. While the conversational interface will leverage Lobe-chat out-of-the-box, dedicated user interfaces will be developed for structured task and habit management, alongside persistent memory and context-aware reminders.

### User Personas
- Individuals managing both personal and professional responsibilities who seek a flexible, conversation-driven productivity tool, enhanced by integrations with Google Calendar and email.
- Users who appreciate natural language interaction for task capture and updates, but also value structured interfaces for managing and viewing their tasks and habits.
- Professionals looking to efficiently capture meeting notes, summarize conversations, plan work tasks using an AI, and receive context-aware reminders delivered via their preferred calendar or email.
- Individuals seeking assistance with personal life management, specifically setting simple date-based reminders, managing recurring tasks, organizing shopping lists, and tracking habits, benefiting from integrated weather information for planning.

### Features
- Conversational Task Capture: Users can communicate naturally to capture simple date-based reminders, recurring tasks, shopping list items, and updates to habit tracking, which the AI then understands and processes, with initial support for capturing tasks via email.
- Persistent Memory: The AI maintains context from past conversations, remembering user preferences, routines, and prior information to ensure continuity and personalization.
- Context-Aware Reminders: The system can set and trigger reminders based on captured tasks and conversational context, with delivery options including Google Calendar and email, and incorporating relevant information like weather updates.
- Google Calendar Integration: Seamlessly deliver reminders and schedule tasks directly to the user's Google Calendar.
- Email Integration: Capture new tasks and deliver reminders via email, enabling flexible interaction with the assistant.
- Weather Context: Provide relevant weather updates within conversations or alongside reminders to inform user planning.
- Hybrid UI Approach: Leverage Lobe-chat out-of-the-box for the core conversational interface, complemented by dedicated, structured UI components for managing and tracking tasks and habits.


---

# Constitution

## Principles
- User-Centric AI Interaction: Prioritize natural language understanding and interaction to make productivity intuitive and effortless.
- Contextual Intelligence: Leverage persistent memory and real-time data (e.g., weather) to provide personalized and relevant assistance.
- Hybrid Flexibility: Offer both conversational and structured interfaces to cater to diverse user preferences and task management styles.
- Integrated Ecosystem: Seamlessly connect with essential external services to enhance user workflow and notification delivery.
- Iterative Value Delivery: Focus on an MVP to quickly deliver core functionality and evolve the product based on user feedback and needs.

## Values
- Efficiency: Streamlining task capture and management through intelligent automation.
- Personalization: Adapting to individual user preferences, routines, and historical context.
- Reliability: Ensuring accurate task processing, timely reminders, and consistent performance.
- Simplicity: Making complex organization feel effortless through natural interaction.
- Adaptability: Providing flexible tools that integrate into various aspects of a user's life and work.

## Constraints
- MVP Scope: Initial focus on simple date-based reminders, recurring tasks, shopping list items, and habit tracking updates.
- Conversational UI Base: The core conversational interface will leverage Lobe-chat out-of-the-box.
- Dedicated Structured UIs: Custom user interfaces must be developed for structured task and habit management, and persistent memory configuration.
- Mandatory Integrations: Initial integrations must include Google Calendar and email (for reminder delivery and task capture), and weather updates for context.
- Persistent Memory Definition: The initial scope for granularity and user control over persistent memory needs to be clearly defined.
- Platform Target: Specific target platforms (web, mobile) for the MVP launch, and Lobe-chat's compatibility, must be determined.

## Team Roles
- **Product Manager:** Defines MVP scope, prioritizes features, translates user needs into requirements, and guides product strategy for Taskly.chat.
- **AI/NLP Engineer:** Designs, develops, and optimizes the AI models for natural language understanding, persistent memory, and context-aware logic.
- **Backend Engineer:** Builds and maintains the core system architecture, API integrations (Google Calendar, Email, Weather), and ensures data persistence and system scalability.
- **Frontend Engineer:** Develops and integrates the Lobe-chat interface, and builds the custom UIs for structured task/habit management and memory configuration.
- **UX/UI Designer:** Creates intuitive and consistent user experience and interface designs for both the conversational and dedicated structured components of Taskly.chat.


---

# Plan

## Architecture
Taskly.chat will employ a hybrid architecture designed for scalability, flexibility, and intelligent processing. The core conversational interface will be powered by Lobe-chat, acting as a decoupled frontend. Custom structured UIs for task management, habit tracking, and memory configuration will be developed as a separate frontend application. The backend will consist of a microservices-oriented architecture, with distinct services for AI/NLP processing, Task Management, Persistent Memory, Integration Management (Google Calendar, Email, Weather), and Notification/Reminder delivery. An API Gateway will act as the single entry point for all frontend applications. Data persistence will leverage a combination of relational databases for structured task/user data and potentially a NoSQL/vector database for conversational context and persistent memory. Services will communicate asynchronously via a message broker.

## Tech Stack
Backend Services: Python with FastAPI for AI/NLP heavy workloads, leveraging libraries like spaCy, Hugging Face Transformers, and LangChain for orchestration. Node.js with NestJS for other core services (Task Management, Integrations). Database: PostgreSQL for structured data (users, tasks, habits, configurations), Redis for caching and transient session state/conversational context. Frontend: Lobe-chat (out-of-the-box) for conversational UI, React with Next.js for dedicated structured UIs (web platform target). Cloud Infrastructure: AWS (leveraging services like AWS Lambda for serverless functions, Amazon RDS for PostgreSQL, SQS for messaging, Amazon S3 for storage, Amazon Cognito for user authentication, API Gateway for API management). Integrations: REST APIs for Google Calendar, Email (via a dedicated email service or provider APIs), and a weather API. DevOps: Docker for containerization, GitHub Actions for CI/CD.

## Non-Functional Requirements
Performance: Ensure low latency for AI processing and conversational responses (<500ms for typical interactions). Scalability: The system must be able to scale to support a growing number of concurrent users and tasks without degradation in performance. Reliability: High availability (99.9% uptime for core services) with robust error handling and monitoring for integrations and AI processes. Security: Implement strong authentication (OAuth 2.0 for third-party integrations, JWT for API access), data encryption at rest and in transit, and adherence to privacy regulations (e.g., GDPR, CCPA). Maintainability: Modular microservices architecture, clear API contracts, comprehensive documentation, and automated testing across all components. Usability: Provide an intuitive and consistent user experience across both conversational and structured interfaces. Data Integrity: Ensure accurate capture, storage, and retrieval of tasks, habits, and persistent memory.



---

## User Stories & Tasks

## Story: Capture Simple Date-Based Reminder via Conversation

**Description:**
As a user, I want to tell Taskly.chat to set a simple reminder for a specific date and time (e.g., 'Remind me to call John tomorrow at 3 PM'), so Taskly.chat accurately captures the intent and schedules the reminder for me to be notified at the specified time via my preferred delivery method. The reminder should be viewable in the structured UI and my integrated calendar/email after creation. Initial support should cover common date/time expressions relative to 'now'. The AI should confirm understanding before creating the reminder. In cases of ambiguity, it should ask clarifying questions (e.g., 'Do you mean 3 PM today or tomorrow?'). Reminders can be set for a one-off occurrence. If I tell Taskly.chat to 'Remind me to buy milk', it should ask if I want a specific date, or if it should be added to a shopping list. In this MVP, if no date is given, it will ask for a date to create a reminder. If I specify 'add to shopping list', it will be a shopping list item. If I say 'I need to buy milk', it should prompt the user to clarify if it is a reminder or a shopping list item and ask for a date if it is a reminder. If no date is given, it will be added to the shopping list. Shopping list items are not time based, and just items that need to be bought, and will be visible in the structured UI as a shopping list. Also, users can say 'add milk to shopping list' and it will just add it directly to the shopping list, or 'add milk to shopping list on monday', it will add it to the shopping list and if it is not bought by Monday, it will remind the user via the preferred delivery method. If the user replies, 'ok', the AI should update the reminder to acknowledge the new intent. If the reminder is time-sensitive, it should confirm the time and date of the reminder. If it is a shopping list item, it should just add it to the shopping list without asking for a date. The AI should not create multiple entries for the same shopping item unless explicitly requested to. When a user asks Taskly.chat to remind them of something, it should create a reminder and a calendar entry if the user has Google Calendar integration enabled and configured. It should also send an email reminder if that is enabled. If a user asks Taskly.chat to add something to their shopping list, it should add it to the shopping list, and if the user also specifies a date, it should create a reminder on that day. Taskly.chat should respond back to the user with a 'Reminder created' or 'Shopping list item added' message to confirm the action. If a user tries to add an item that already exists on the shopping list, Taskly.chat should ask for confirmation if the user wants to add it again, or update the quantity. In this MVP, we will only add the item again, we will not track quantity. If the user asks for weather and a reminder in the same conversation, the weather update should be provided separately from the reminder confirmation, but in the same conversational flow. It should not be mixed together in one sentence. The weather should be mentioned before the confirmation of the reminder, for example, first the weather, and then the confirmation message. If it is a date-based reminder, the weather should be mentioned for that day. If no date is mentioned in the conversation, the weather for the current day should be given. The weather should only be mentioned if the user has requested it. If the user requests 'Remind me to buy milk on monday' and also asks for the weather, then it will mention the weather for Monday. The weather information should be short and concise, and not verbose. Taskly.chat should not ask for the user's location. It should fetch the location based on the user's IP address. If it cannot fetch the IP address due to VPN or other network issues, it should ask the user to provide their location if they want to get weather updates. If the user asks for the weather of a specific location, Taskly.chat should provide the weather for that location, it should also store that location as the default location for that user, so next time it does not have to be asked. If the user asks for weather, and then mentions a new location, it should overwrite the previous location, and use the new one as default. If the user asks for a reminder for 'tomorrow' and then also asks for the weather, it should give the weather of tomorrow, and not today. If the user asks for a specific date, it should also provide the weather of that date. If a user says 'update habit', it should confirm the habit name, and then ask for the update, for example 'meditation'. Then it should ask 'what is the update?'. The user can then say 'I meditated for 30 minutes'. Taskly.chat should then save the update in the habit tracking. If the user says 'I meditated today', Taskly.chat should confirm the habit 'meditation' and save today's date as an update. When adding an item to the shopping list, the user can also specify a quantity, e.g. 'add 2 liters of milk to shopping list', but for MVP we will only add the item itself, not the quantity. The AI will ask for clarification if quantity is mentioned. If the user replies 'Yes, add 2 liters of milk', it will add 'milk' twice to the shopping list. The AI should store the conversation history to learn from it and provide better responses in the future. The persistent memory must store all conversations and user inputs to build on its understanding of the user. If the user mentions a specific product name multiple times, it should be stored in persistent memory. If the user mentions a specific person (e.g. John) multiple times, it should be stored in persistent memory as a contact. If the user asks for weather and a specific location, it should be stored in persistent memory as the user's preferred location for weather updates. The AI should be able to identify entities from the conversation, for example, if the user says 'remind me to call John on Monday', it should identify 'John' as a person, and 'Monday' as a date. All these entities should be stored in persistent memory for better future conversations. The AI should also be able to understand different ways of expressing dates and times, for example, 'tomorrow', 'next week', 'in 3 days', 'on Christmas', 'next Monday', 'in 2 hours', 'at 5 PM', 'noon', 'midnight', etc. and accurately convert them into standard date-time formats. For the MVP, we will only support 'tomorrow', 'next week', 'next monday', 'this monday', 'on a specific date and time', 'in 2 hours', 'in X minutes'. If the user mentions an item, for example, 'milk', and then asks to buy it in the same conversation, it should be able to create a shopping list item, and then if the user says 'on Monday', it should add a reminder to buy milk on Monday. If the user says 'Remind me to call John on Monday and get the project details from him', it should create a reminder to call John on Monday, and also add 'get project details from him' as a description for the reminder. The description should also be visible in the structured UI and the calendar entry. If the user asks for a reminder about 'meeting with Bob' and also asks for the weather for that day, it should mention the weather for the day of the meeting, and then confirm the reminder. If the user mentions a specific task, e.g. 'work on project', and then asks to be reminded about it, it should create a reminder for 'work on project'. If the user asks 'remind me about project' and then says 'next monday', it should create a reminder for 'project' on next Monday. If the user asks for a specific habit to be tracked, it should be created in the habit tracker. If the user says 'track meditation habit', it should create a new habit 'meditation' in the habit tracker. If the user says 'update my meditation habit for today', it should confirm the habit and update it for today. The AI should be able to handle natural language variations for habit updates, e.g., 'I did my meditation', 'meditated today', 'completed meditation', etc. In all these cases, it should update the 'meditation' habit for today. The AI should ensure that it is not confused by multiple requests in a single conversational sentence, and should ask for clarification if it is. For example, if the user says 'Remind me to call John on Monday and also add milk to my shopping list', it should create a reminder and add the item to the shopping list, and confirm both actions separately.

### Tasks

- [ ] **Develop NLP Model for Core Intent Recognition** [AI/NLP Engineer]
  - Train and implement an NLP model capable of accurately identifying primary user intents: 'set reminder', 'add to shopping list', 'update habit', and 'get weather'.
    
    ### Acceptance Criteria:
    *   Successfully distinguishes between 'Remind me to call John' (reminder) and 'Add milk to shopping list' (shopping list).
    *   Accurately identifies 'I meditated today' as a habit update.
    *   Correctly recognizes 'What's the weather like?' as a weather request.
- [ ] **Implement Date/Time and Entity Extraction (NER)** [AI/NLP Engineer]
  - Develop robust Named Entity Recognition (NER) capabilities to extract key entities from user utterances.
    
    ### Acceptance Criteria:
    *   Extracts specific dates and times (e.g., 'tomorrow at 3 PM', 'next Monday', '2 hours from now', 'on 25th December').
    *   Identifies task descriptions (e.g., 'call John', 'buy milk', 'work on project').
    *   Extracts specific persons (e.g., 'John', 'Bob').
    *   Extracts locations for weather requests.
    *   Extracts habit names (e.g., 'meditation').
    *   Handles variations like 'noon', 'midnight'.
    *   Supports MVP date/time expressions: 'tomorrow', 'next week', 'next monday', 'this monday', 'on a specific date and time', 'in 2 hours', 'in X minutes'.
- [ ] **Develop Dialogue Management for Clarification & Confirmation** [AI/NLP Engineer]
  - Implement conversational logic for handling ambiguity and confirming user actions.
    
    ### Acceptance Criteria:
    *   If date/time is ambiguous, asks clarifying questions (e.g., 'Do you mean 3 PM today or tomorrow?').
    *   If task type is ambiguous (e.g., 'I need to buy milk'), asks 'Is this a reminder or a shopping list item? If a reminder, for when?'.
    *   Confirms actions with messages like 'Reminder created' or 'Shopping list item added'.
    *   If user replies 'ok' after a suggestion, updates the reminder/intent.
    *   Confirms the specific time and date for time-sensitive reminders.
    *   If quantity is mentioned for shopping list, asks for clarification and adds item multiple times if confirmed.
- [ ] **Implement Persistent Memory for Conversation & Entities** [AI/NLP Engineer]
  - Design and implement the AI component to store and retrieve conversation history, identified entities (persons, items, locations), and user preferences for future interactions.
    
    ### Acceptance Criteria:
    *   Stores full conversation history.
    *   Persistently stores identified persons (e.g., 'John'), items ('milk'), and preferred weather locations (e.g., after asking for a specific location's weather).
    *   Uses stored entities to enhance future NLU and responses.
    *   Stores specific product names and person names from conversation history.
- [ ] **Develop Logic for Multi-Intent Utterances** [AI/NLP Engineer]
  - Implement AI logic to process and act upon multiple distinct requests within a single user sentence.
    
    ### Acceptance Criteria:
    *   Successfully separates and acts on 'Remind me to call John on Monday AND also add milk to my shopping list'.
    *   Provides separate confirmations for each action.
    *   If 'weather' is requested with a reminder, provides weather information first, then the reminder confirmation.
    *   Ensures weather update precedes reminder confirmation in the conversational flow.
- [ ] **Implement Habit Update Natural Language Understanding** [AI/NLP Engineer]
  - Develop the NLP capability to understand various natural language expressions for updating a habit.
    
    ### Acceptance Criteria:
    *   Recognizes 'I did my meditation', 'meditated today', 'completed meditation' as updates for the 'meditation' habit.
    *   Prompts for update details if only habit name is given (e.g., 'What is the update?' after 'update meditation habit').
    *   Parses and saves numeric updates (e.g., 'meditated for 30 minutes').
    *   If user says 'I meditated today', confirms the habit and saves today's date as an update.
- [ ] **Develop Reminder Management API** [Backend Engineer]
  - Create backend API endpoints for creating, retrieving, and updating reminders.
    
    ### Acceptance Criteria:
    *   `POST /reminders`: Creates a new reminder with task, date, time, description, and user ID.
    *   Integrates with Google Calendar and Email sending logic based on user preferences.
    *   Stores reminder details (id, title, description, dateTime, deliveryMethods, userId) in PostgreSQL.
- [ ] **Develop Shopping List Management API** [Backend Engineer]
  - Create backend API endpoints for adding and retrieving shopping list items.
    
    ### Acceptance Criteria:
    *   `POST /shopping-list`: Adds an item to the shopping list, with an optional reminder date.
    *   Includes logic to detect if an item already exists on the list and communicate this to the AI for user confirmation.
    *   Does not store quantity in MVP; if quantity is specified, the item is added multiple times if user confirms.
    *   Stores shopping list items (id, item_name, optional_reminder_date, userId) in PostgreSQL.
- [ ] **Develop Habit Tracking API** [Backend Engineer]
  - Create backend API endpoints for creating new habits and recording habit updates.
    
    ### Acceptance Criteria:
    *   `POST /habits`: Creates a new habit for a user (habit_name, userId).
    *   `POST /habits/{habit_id}/updates`: Records an update for a specific habit, including date and any user-provided details (update_date, update_details, habit_id).
    *   Stores habits and updates in PostgreSQL.
- [ ] **Integrate with Google Calendar API** [Backend Engineer]
  - Implement backend service logic to create calendar events in Google Calendar when a reminder is set and the integration is enabled.
    
    ### Acceptance Criteria:
    *   Authenticates with Google Calendar API using user's configured credentials.
    *   Creates an event with reminder title, description, date, and time.
    *   Handles successful event creation and errors gracefully.
- [ ] **Integrate with Email Service for Reminders** [Backend Engineer]
  - Implement backend service logic to send email reminders when a reminder is set and email delivery is enabled.
    
    ### Acceptance Criteria:
    *   Connects to a configured email service/provider.
    *   Sends an email with reminder details (title, description, time, date) to the user's registered email address.
    *   Handles email sending success/failure.
- [ ] **Develop Weather Integration Service** [Backend Engineer]
  - Implement backend service for fetching weather information based on location.
    
    ### Acceptance Criteria:
    *   Integrates with a chosen Weather API (e.g., OpenWeatherMap).
    *   Includes logic to fetch user's location via IP address if no specific location is provided.
    *   Allows fetching weather for the current day or a specified future date.
    *   Stores and retrieves user's preferred weather location in PostgreSQL (overwriting previous if a new one is specified).
    *   Handles cases where IP location is unavailable by prompting the AI to ask the user for location.
    *   Provides concise weather information, not verbose.
- [ ] **Implement Persistent Memory Backend Storage** [Backend Engineer]
  - Design and implement the PostgreSQL schema and API endpoints for storing and retrieving conversation history and identified entities for the AI.
    
    ### Acceptance Criteria:
    *   Schema for storing user conversations, including timestamps and participant.
    *   Schema for storing identified entities (type: person, item, location, habit; value; user_id).
    *   API to store and retrieve this data efficiently for the AI/NLP component.
- [ ] **Implement User Preference Management (Delivery/Location)** [Backend Engineer]
  - Create API endpoints and database schema to manage user preferences for reminder delivery methods (Google Calendar, Email) and default weather location.
    
    ### Acceptance Criteria:
    *   Allows users to enable/disable Google Calendar and Email integration.
    *   Stores the user's chosen default weather location.
    *   API to fetch user preferences to inform AI and integration services.
- [ ] **Display Structured Reminders UI** [Frontend Engineer]
  - Develop the React/Next.js UI component to display a list of upcoming and past reminders for the user.
    
    ### Acceptance Criteria:
    *   Fetches reminder data from the Backend API.
    *   Displays reminder title, description, date, and time.
    *   UI is responsive and user-friendly, reflecting the structured task management component.
- [ ] **Display Structured Shopping List UI** [Frontend Engineer]
  - Develop the React/Next.js UI component to display the user's shopping list items.
    
    ### Acceptance Criteria:
    *   Fetches shopping list data from the Backend API.
    *   Displays item name and any associated reminder date.
    *   UI is responsive and user-friendly, reflecting the structured task management component.
- [ ] **Display Structured Habit Tracking UI** [Frontend Engineer]
  - Develop the React/Next.js UI component to display user's habits and their tracking updates.
    
    ### Acceptance Criteria:
    *   Fetches habit data and updates from the Backend API.
    *   Displays habit name and a list of recorded updates (date, details).
    *   UI is responsive and user-friendly, reflecting the structured task management component.
- [ ] **Integrate Lobe-chat Output for Confirmations & Questions** [Frontend Engineer]
  - Ensure the Lobe-chat interface correctly displays AI-generated confirmation messages, clarifying questions, and weather updates.
    
    ### Acceptance Criteria:
    *   Shows 'Reminder created' / 'Shopping list item added' confirmations clearly.
    *   Displays clarifying questions (e.g., date ambiguity, reminder vs. shopping list) for user interaction.
    *   Presents weather information concisely before other confirmations if requested, maintaining separate conversational elements.
    *   Ensures weather updates for the requested day are shown.

---

## Story: Accurate Natural Language Understanding for Task Capture

**Description:**
As a user, I want the AI to accurately understand a wide range of natural language expressions for task capture, including various phrasings for dates, times, task types, and recurring patterns, so my intentions are consistently translated into correct actions without requiring precise syntax. This includes handling synonyms, implied contexts, and variations in sentence structure. The AI should be able to differentiate between simple reminders, recurring tasks, shopping list items, and habit updates based on the conversational input and persistent memory.

### Tasks

- [ ] **Define NLU Intent & Entity Extraction Scope** [Product Manager]
  - Collaborate with the AI/NLP Engineer to define the precise scope of natural language understanding for task capture.
    *   Identify key intents (e.g., simple reminder, recurring task, shopping list item, habit update).
    *   Specify critical entities to extract (e.g., date, time, recurrence pattern, task description, context).
    *   Gather example phrasings, synonyms, and anticipated edge cases for each intent and entity.
    *   Establish initial accuracy benchmarks for the NLU model.
- [ ] **Research & Select Core NLU Libraries/Frameworks** [AI/NLP Engineer]
  - Evaluate existing NLP libraries and frameworks (e.g., spaCy, Hugging Face Transformers, LangChain, dateparser) within the Python FastAPI stack.
    *   Select the most suitable tools for Named Entity Recognition (NER), intent classification, and syntactic parsing.
    *   Document the chosen approach and provide justification for the selections.
- [ ] **Develop Custom Intent Classifier for Task Types** [AI/NLP Engineer]
  - Design and implement a machine learning model or rule-based system to accurately classify user input into distinct task types:
    *   Simple Reminder
    *   Recurring Task
    *   Shopping List Item
    *   Habit Update
    *   Train the model using diverse training data covering various phrasings and implied contexts.
    *   Evaluate model performance and iterate on improvements.
- [ ] **Implement Robust Date & Time Entity Extraction** [AI/NLP Engineer]
  - Integrate and configure a date/time parsing library (e.g., `dateparser`) or develop custom extraction rules.
    *   Ensure accurate extraction and normalization of various date and time expressions, including:
        *   Relative (e.g., "tomorrow", "next Monday", "in 3 days")
        *   Absolute (e.g., "December 25th", "2023-12-25")
        *   Ambiguous (e.g., "Friday" - resolve based on current date)
        *   Time expressions (e.g., "at 3 PM", "noon", "morning")
        *   Date ranges (e.g., "from Tuesday to Friday")
- [ ] **Implement Recurring Pattern Recognition Module** [AI/NLP Engineer]
  - Develop or integrate a module to identify and parse recurring patterns from natural language.
    *   Support various recurrence types:
        *   Daily ("every day")
        *   Weekly ("every Monday", "twice a week")
        *   Monthly ("on the 15th", "first Tuesday of the month")
        *   Yearly ("every year on my birthday")
        *   Interval-based ("every 3 days", "every other week")
    *   Normalize detected patterns into a structured format for storage.
- [ ] **Design & Implement NLU Service API** [Backend Engineer]
  - Collaborate to design the API endpoint(s) for the NLU service (FastAPI).
    *   Define request and response payloads:
        *   **Request:** User's raw natural language input, optional user context.
        *   **Response:** Structured JSON object containing parsed data such as `taskType`, `description`, `dueDate`, `dueTime`, `recurrencePattern`, and `entities`.
    *   Implement the API endpoint in FastAPI to expose the NLU capabilities.
- [ ] **Integrate NLU Service with Task Management Backend** [Backend Engineer]
  - Develop or extend the Task Management service (Node.js/NestJS) to consume the structured output from the NLU service API.
    *   Implement logic to transform the NLU output into the database schema for tasks, reminders, shopping items, and habit entries.
    *   Ensure robust data validation and error handling for NLU responses.
    *   Persist the structured task data to the PostgreSQL database.
- [ ] **Implement Context-Aware NLU Integration with Persistent Memory** [AI/NLP Engineer]
  - Develop mechanisms for the NLU model to leverage persistent memory (e.g., user preferences, previously discussed topics from Redis/PostgreSQL).
    *   This includes:
        *   Resolving ambiguous references (e.g., "add *it* to my shopping list").
        *   Inferring context for incomplete requests (e.g., "remind me about that later" referring to the last mentioned item).
        *   Personalizing interpretations based on user habits or location.
- [ ] **Develop Comprehensive NLU Test Suite** [AI/NLP Engineer]
  - Create an extensive suite of unit and integration tests for the NLU components.
    *   Cover a wide variety of natural language inputs, including:
        *   Synonyms and alternative phrasings.
        *   Complex sentence structures.
        *   Inputs with implied context.
        *   Edge cases for dates, times, and recurrence.
    *   Automate testing to ensure consistent accuracy and prevent regressions during model updates.

---

## Story: Persistent Memory for Personalized Interactions

**Description:**
As a user, I want Taskly.chat to remember my preferences, routines, and past conversational context (e.g., preferred reminder delivery times, common shopping items, frequently mentioned contacts), so future interactions are more personalized, efficient, and require less repetitive information. This includes remembering my default weather location, common contacts, and frequently mentioned product names. The AI should use this memory to infer intent and provide more accurate and relevant responses. For example, if I previously asked for weather for 'London', the next time I ask for 'weather', it should give me weather for 'London'. If I mention 'John' multiple times, it should remember 'John' as a contact. If I ask for 'milk' multiple times, it should remember 'milk' as a frequent shopping item.

### Tasks

- [ ] **Design and Implement Database Schema for User Preferences** [Backend Engineer]
  - Create and migrate database schema in PostgreSQL to support user-specific persistent memory. This includes defining tables and fields to store:
    *   `user_preferences` (e.g., `user_id`, `default_weather_location`)
    *   `user_frequent_entities` (e.g., `user_id`, `entity_type` ('contact', 'shopping_item'), `entity_value`, `mention_count`, `last_mentioned_date`)
    
    **Acceptance Criteria:**
    *   New tables and columns are accurately defined and implemented in the PostgreSQL database.
    *   Database relationships, particularly linking preferences and frequent entities to a `user_id`, are correctly established.
    *   Basic CRUD operations for these new tables are verified to ensure data integrity and accessibility.
- [ ] **Develop Backend Service Endpoints for Persistent Memory Management** [Backend Engineer]
  - Implement robust FastAPI/NestJS endpoints to enable the AI/NLP service to store, retrieve, and update user preferences and frequently mentioned entities in the PostgreSQL database.
    
    **Key Endpoints to Develop:**
    *   `POST /api/users/{user_id}/preferences`: To update a user's default preferences (e.g., `default_weather_location`).
    *   `GET /api/users/{user_id}/preferences`: To retrieve all preferences for a given user.
    *   `POST /api/users/{user_id}/frequent-entities`: To add new or increment the count for existing frequent entities (contacts, shopping items).
    *   `GET /api/users/{user_id}/frequent-entities`: To retrieve a list of frequent entities, potentially filtered by type.
    
    **Acceptance Criteria:**
    *   All specified API endpoints are defined, implemented, and thoroughly documented.
    *   Endpoints correctly persist data to and retrieve data from the PostgreSQL database.
    *   Authentication and authorization mechanisms are correctly applied to all endpoints, ensuring only authorized users can access or modify their specific data.
- [ ] **Implement NLP Module for Contextual Entity Extraction** [AI/NLP Engineer]
  - Develop and integrate an NLP module (leveraging spaCy/Hugging Face Transformers) into the AI/NLP service to accurately identify and extract key entities from user utterances that are relevant for persistent memory.
    
    **Entity Types to Extract:**
    *   **Locations**: For weather-related queries (e.g., 'London', 'New York').
    *   **Person Names**: For potential contacts (e.g., 'John', 'Sarah').
    *   **Common Nouns/Phrases**: For shopping items or product names (e.g., 'milk', 'bread', 'laptop').
    
    **Acceptance Criteria:**
    *   The NLP module demonstrates high accuracy in identifying and extracting the specified entity types from natural language input.
    *   The module can handle common variations and synonyms for these entities.
    *   Processing performance is optimized to ensure a responsive conversational experience.
- [ ] **Develop AI Logic for Persistent Preference Inference** [AI/NLP Engineer]
  - Implement core AI logic within the AI/NLP service (FastAPI, LangChain) responsible for inferring and persistently storing user preferences based on recurring patterns in conversational history and repeated entity mentions.
    
    **Inference Rules to Implement:**
    *   **Default Weather Location**: If a user frequently asks for weather in a specific city (e.g., 3 distinct queries for 'London'), infer and store 'London' as their `default_weather_location` via the Backend API.
    *   **Frequent Contacts**: If a contact name is mentioned more than a configurable threshold (N times) in relevant contexts, add or update it as a frequent contact in `user_frequent_entities`.
    *   **Frequent Shopping Items**: If a shopping item is mentioned repeatedly (N times) in shopping list contexts, add or update it as a frequent item in `user_frequent_entities`.
    
    **Acceptance Criteria:**
    *   The AI service correctly identifies and sends API requests to the Backend for updating `default_weather_location` based on user behavior.
    *   The AI service accurately detects and updates frequent contacts and shopping items in the database.
    *   Thresholds for inference (e.g., 'N times') are configurable via system settings.
- [ ] **Integrate Persistent Memory into AI Response Generation** [AI/NLP Engineer]
  - Modify the AI's response generation pipeline to actively retrieve and leverage stored user preferences and frequent entities from the Backend service, ensuring future interactions are highly personalized and efficient.
    
    **Integration Points:**
    *   **Weather Queries**: When a user asks a general weather question (e.g., 'What's the weather?') without specifying a location, automatically retrieve and use their `default_weather_location` for the weather API call.
    *   **Task/Reminder Creation**: When users mention entities that could be frequent contacts or shopping items, cross-reference `user_frequent_entities` to provide contextual understanding, auto-completion, or disambiguation.
    *   **Contextual Dialogue**: Ensure AI responses demonstrate awareness of previously stored preferences, minimizing the need for users to re-state information.
    
    **Acceptance Criteria:**
    *   General weather queries correctly provide information for the user's stored `default_weather_location`.
    *   The AI accurately recognizes and utilizes frequent contacts or shopping items mentioned in conversations for task creation or list management.
    *   AI responses feel personalized and acknowledge prior preferences without explicit prompts from the user.
- [ ] **Implement Redis for Short-term Conversational Context Management** [Backend Engineer]
  - Integrate Redis into the backend services to efficiently store and manage short-term, session-specific conversational context for each user. This will allow the AI to maintain coherent dialogue across a limited number of turns, aiding immediate follow-up questions and entity resolution.
    
    **Functionality:**
    *   Store recent conversational turns (e.g., last 5 messages, identified entities from the last message) in Redis, uniquely identifiable per user session.
    *   Provide an API for the AI/NLP service to quickly retrieve this short-term context.
    *   Configure context to expire automatically after a defined period of user inactivity to manage memory usage.
    
    **Acceptance Criteria:**
    *   Conversational history is successfully stored in and retrieved from Redis for active user sessions.
    *   The AI/NLP service can access and utilize this short-term context for more fluid interactions.
    *   Context data in Redis expires as configured, ensuring efficient resource utilization and privacy.

---

## Story: Configure Google Calendar Integration

**Description:**
As a user, I want to easily connect my Google account with Taskly.chat through a secure OAuth 2.0 flow, so Taskly.chat can seamlessly integrate with my Google Calendar for reminder delivery and scheduling tasks. This includes allowing me to select which specific Google Calendar Taskly.chat should use. The integration setup should be accessible via the structured UI settings. I should also be able to disconnect or reconfigure the integration at any time.

### Tasks

- [ ] **Design and Implement Database Schema for Google Calendar Integration** [Backend Engineer]
  - Define necessary tables and fields in PostgreSQL to securely store Google integration details. This includes:
    *   User ID
    *   Google account identifier
    *   Encrypted access token
    *   Encrypted refresh token
    *   Token expiry timestamp
    *   Selected Google Calendar ID for events/reminders
- [ ] **Develop Google OAuth 2.0 Endpoints (Initiation & Callback)** [Backend Engineer]
  - Implement the core backend logic for Google OAuth 2.0:
    *   Create an endpoint (e.g., `/api/integrations/google/connect`) to initiate the OAuth flow, generating the authorization URL with required scopes.
    *   Create a callback endpoint (e.g., `/api/integrations/google/callback`) to handle the redirect from Google.
    *   Exchange the authorization code for access and refresh tokens upon successful callback.
    *   Securely store the tokens and user's Google ID in the database.
    *   Handle potential errors and edge cases during the OAuth process.
- [ ] **Implement Secure Token Storage and Refresh Mechanism** [Backend Engineer]
  - Ensure the robust and secure management of Google API tokens:
    *   Implement encryption for access and refresh tokens before storage in the database.
    *   Develop a mechanism to automatically refresh expired access tokens using the stored refresh token before making Google Calendar API calls.
    *   Implement logging and alerts for refresh token expiry or failure.
- [ ] **Develop Google Calendar Listing API** [Backend Engineer]
  - Create a backend API endpoint (e.g., `/api/integrations/google/calendars`) that:
    *   Authenticates the user.
    *   Uses the stored Google tokens to fetch a list of all available Google Calendars associated with the user's connected account.
    *   Returns the list of calendars (ID and name) to the frontend.
- [ ] **Develop API for Selecting/Updating Google Calendar** [Backend Engineer]
  - Create a backend API endpoint (e.g., `/api/integrations/google/select-calendar`) to:
    *   Receive a selected Google Calendar ID from the frontend.
    *   Persist this selected calendar ID in the database for the user, linking it to their Google integration.
    *   Validate that the selected calendar ID belongs to the connected Google account.
- [ ] **Develop API for Disconnecting Google Calendar Integration** [Backend Engineer]
  - Create a backend API endpoint (e.g., `/api/integrations/google/disconnect`) to:
    *   Revoke Google API tokens from Google's end, if necessary.
    *   Clear all stored integration-related data (tokens, selected calendar ID) for the user in the database.
    *   Update the user's integration status.
- [ ] **Build Google Calendar Integration Settings UI** [Frontend Engineer]
  - Develop the user interface within the structured UI for managing Google Calendar integration:
    *   Create a dedicated section in 'Settings' for Integrations.
    *   Display the current status of Google Calendar integration (e.g., 'Not Connected', 'Connected to [email]', 'Error').
    *   Include a prominent 'Connect Google Account' button to initiate the OAuth flow.
- [ ] **Implement OAuth Flow Initiation from UI** [Frontend Engineer]
  - Integrate the 'Connect Google Account' button to:
    *   Call the backend's `/api/integrations/google/connect` endpoint.
    *   Redirect the user to the received Google authorization URL.
    *   Handle the redirect back to the Taskly.chat frontend after successful Google authentication, potentially displaying a loading or success message.
- [ ] **Develop UI for Google Calendar Selection** [Frontend Engineer]
  - Once a user is connected, build the UI to manage their calendar selection:
    *   Display a loading indicator while fetching the list of available calendars from `/api/integrations/google/calendars`.
    *   Present a dropdown or list of fetched Google Calendars, allowing the user to select their preferred calendar for Taskly.chat use.
    *   Include a 'Save' button to send the selected calendar ID to the backend via `/api/integrations/google/select-calendar`.
    *   Provide clear visual feedback on successful selection or any errors.
- [ ] **Implement Disconnect/Reconfigure UI** [Frontend Engineer]
  - Provide options for users to manage their integration:
    *   Add a 'Disconnect' button or link within the Google Calendar integration settings.
    *   Implement a confirmation dialog before proceeding with disconnection.
    *   Call the backend's `/api/integrations/google/disconnect` endpoint when 'Disconnect' is confirmed.
    *   Ensure the UI reverts to the 'Connect' state after disconnection.
    *   Allow easy re-initiation of the connection process for reconfiguration.
- [ ] **Design Google Calendar Integration UI/UX Flow** [UX/UI Designer]
  - Create a comprehensive design for the Google Calendar integration experience:
    *   Develop wireframes and high-fidelity mockups for the integration settings page within the structured UI.
    *   Design the user journey for connecting, selecting a specific calendar, and disconnecting the integration.
    *   Define all UI states: initial, loading, connected, disconnected, error, and success messages.
    *   Ensure the design is intuitive, secure, and consistent with Taskly.chat's overall aesthetic.
- [ ] **Define Google Calendar Integration OAuth Scopes and Success Criteria** [Product Manager]
  - Specify the product requirements for the Google Calendar integration:
    *   Clearly define the minimal necessary Google API OAuth scopes (e.g., `https://www.googleapis.com/auth/calendar.events`, `https://www.googleapis.com/auth/calendar.readonly`) to ensure least privilege.
    *   Outline detailed acceptance criteria for a successful integration, covering connection, calendar selection, task scheduling, reminder delivery, and disconnection.
    *   Develop a plan for user acceptance testing (UAT) scenarios.

---

## Story: Configure Email Integration

**Description:**
As a user, I want to connect my email address to Taskly.chat within the structured UI settings, so Taskly.chat can send me reminders and allow me to capture tasks by sending emails to a unique Taskly.chat address. This setup should guide me through the necessary steps to authorize Taskly.chat to send emails on my behalf (if applicable for advanced features) and define the unique inbound email address for task capture. I should also be able to configure preferred email reminder times (e.g., 'send all-day reminders at 9 AM').

### Tasks

- [ ] **Design UI/UX for Email Integration Settings** [UX/UI Designer]
  - Create wireframes and high-fidelity mockups for the email integration settings page within the structured UI. This includes:
    *   Layout for connecting/disconnecting email accounts.
    *   User flow for OAuth/authorization with email service providers.
    *   Displaying the generated unique inbound email address for task capture.
    *   Controls for configuring preferred email reminder times (e.g., a time picker).
    *   Visual indicators for connection status and error states.
- [ ] **Define Detailed Requirements for Email Integration** [Product Manager]
  - Elaborate on the user story by defining specific, granular requirements for:
    *   Supported email service providers for OAuth (e.g., Google, Outlook).
    *   Required authorization scopes for outbound email sending.
    *   Rules and format for generating unique inbound email addresses for each user.
    *   Minimum viable acceptance criteria for task extraction from inbound emails (e.g., parsing subject for title, simple date detection).
    *   Detailed error handling and user feedback mechanisms for connection issues and failed sends/receives.
- [ ] **Implement Backend API for Email Integration Management** [Backend Engineer]
  - Develop REST API endpoints using NestJS (Node.js) to manage email integration settings. This involves:
    *   Endpoints for initiating and completing OAuth flows with email service providers for outbound email sending capabilities.
    *   API to generate, retrieve, and manage unique inbound email addresses for users (e.g., `userhash@taskly.chat`).
    *   Endpoints for storing and retrieving user-specific email integration settings, including encrypted authorization tokens, the unique inbound address, and preferred reminder times.
    *   Validation and persistence of user-configured email reminder preferences in the database.
- [ ] **Database Schema Updates for Email Integration** [Backend Engineer]
  - Update the PostgreSQL database schema to persist all necessary information for email integration:
    *   Table/columns to store user-specific email integration status.
    *   Secure storage for OAuth tokens/credentials (encrypted).
    *   Field for the generated unique inbound email address for each user.
    *   Column for preferred email reminder times (e.g., `time_of_day_utc`).
    *   Indexes for efficient lookup of email integration settings by user ID.
- [ ] **Develop Outbound Email Sending Service** [Backend Engineer]
  - Implement a dedicated service responsible for sending emails (e.g., task reminders, notifications) on behalf of users. Key features include:
    *   Integration with an email sending library or API (e.g., Nodemailer, Google Mail API) using the authorized user credentials.
    *   Support for email templating to ensure consistent and professional reminder formats.
    *   Robust error handling, logging, and retry mechanisms for failed email deliveries.
    *   Mechanism to check and refresh OAuth tokens as needed.
- [ ] **Implement Inbound Email Processing Service** [Backend Engineer]
  - Develop a service to efficiently receive and process emails sent to unique Taskly.chat addresses. This includes:
    *   Setting up an inbound email receiving mechanism (e.g., configuring AWS SES to trigger a Lambda function, or using a dedicated email parsing API/service).
    *   Extracting raw email components such as sender, subject, and body content.
    *   Queueing incoming emails (e.g., via SQS) for asynchronous NLP processing and task extraction.
- [ ] **Develop NLP for Task Extraction from Inbound Emails** [AI/NLP Engineer]
  - Design and implement the natural language processing (NLP) logic to extract actionable tasks and relevant details from the subject and body of incoming emails. This involves:
    *   Leveraging NLP libraries like spaCy or Hugging Face Transformers for entity recognition (e.g., task title, due dates, categories).
    *   Defining and implementing parsing rules to interpret user intent from email content.
    *   Integrating the extracted task information with the core task management system to create new tasks.
    *   Handling variations in natural language input for task descriptions and due dates.
- [ ] **Build Frontend UI for Email Integration Settings** [Frontend Engineer]
  - Develop the React/Next.js components and pages for the email integration settings in the structured UI, based on approved UI/UX designs. This task covers:
    *   Implementing buttons/links to initiate the OAuth flow for connecting email accounts.
    *   Displaying the current connection status clearly to the user.
    *   Presenting the unique inbound email address for task capture in an easily copyable format.
    *   Creating interactive UI components (e.g., time pickers, dropdowns) for users to configure their preferred email reminder times.
    *   Integrating the frontend components with the `backend-email-api` for all data retrieval, updates, and authorization processes.
    *   Displaying appropriate success, error, and loading feedback to the user.

---

## Story: Deliver Reminders to Google Calendar

**Description:**
As a user with Google Calendar integration enabled, I want Taskly.chat to automatically add my scheduled reminders and recurring tasks as events in my specified Google Calendar, so I can view my Taskly.chat tasks alongside my other personal and professional commitments within my calendar interface. Each calendar event should clearly indicate it originated from Taskly.chat and include the task description. If the reminder is for a specific date and time, it should be added as a timed event. If it is an all-day reminder (e.g., 'Remind me to submit report on Friday'), it should be added as an all-day event.

### Tasks

- [ ] **Implement Google Calendar OAuth Flow** [Backend Engineer]
  - Develop the backend endpoints and logic required for users to authenticate with Google, grant Taskly.chat access to their Google Calendars, and securely store the resulting OAuth tokens.
    
    *   **Acceptance Criteria:**
        *   User can initiate the Google OAuth flow from Taskly.chat.
        *   Upon successful authorization, Taskly.chat securely stores valid access and refresh tokens linked to the user.
        *   A token refresh mechanism is implemented to ensure continuous access without re-authentication.
- [ ] **Develop Google Calendar API Service Layer** [Backend Engineer]
  - Create a dedicated service or module within the Node.js backend to abstract interactions with the Google Calendar API. This service will handle listing user calendars, creating events, updating events, and deleting events.
    
    *   **Acceptance Criteria:**
        *   The service can successfully list all available Google Calendars for an authenticated user.
        *   The service can create a new event in a specified Google Calendar.
        *   The service can update an existing event in Google Calendar (e.g., when a task changes).
        *   The service can delete an event from Google Calendar.
        *   Robust error handling for Google Calendar API responses (e.g., network issues, authorization errors, rate limits) is implemented.
- [ ] **Extend Task & User Models for Calendar Integration** [Backend Engineer]
  - Modify the PostgreSQL database schema to include necessary fields for storing Google Calendar integration preferences and linking Taskly.chat tasks to their corresponding Google Calendar events.
    
    *   **Acceptance Criteria:**
        *   The User model includes fields such as `googleCalendarIntegrationEnabled` (boolean) and `selectedGoogleCalendarId` (string) to store user preferences.
        *   The Task model includes a nullable field `googleCalendarEventId` (string) to store the ID of the corresponding Google Calendar event, facilitating updates and deletions.
- [ ] **Implement Task-to-Google Event Conversion Logic** [Backend Engineer]
  - Develop the core logic to accurately map Taskly.chat task properties (title, description, due date, due time, recurrence, all-day status) to Google Calendar event properties (summary, description, start, end, all-day flag).
    
    *   **Acceptance Criteria:**
        *   Taskly.chat tasks with a specific date and time are correctly converted into timed Google Calendar events.
        *   Taskly.chat tasks marked as 'all-day' are correctly converted into all-day Google Calendar events.
        *   The Google Calendar event `summary` is automatically generated with a clear indicator of origin (e.g., `"[Taskly.chat] " + task.title`).
        *   The Google Calendar event `description` includes the full `task.description` from Taskly.chat.
- [ ] **Develop Event Synchronization Mechanism (Creation/Updates)** [Backend Engineer]
  - Implement a robust mechanism within the Task Management service (Node.js) to automatically synchronize Taskly.chat tasks with Google Calendar. This includes triggering the creation of new events and updating existing ones when tasks are modified in Taskly.chat.
    
    *   **Acceptance Criteria:**
        *   New scheduled or recurring tasks created in Taskly.chat successfully trigger the creation of a corresponding event in the user's selected Google Calendar.
        *   Changes to a task's title, description, due date/time, or all-day status in Taskly.chat are accurately reflected in the corresponding Google Calendar event.
        *   Synchronization operations are handled asynchronously (e.g., via AWS SQS) to prevent blocking user actions and ensure reliability.
- [ ] **Implement Task Deletion Synchronization** [Backend Engineer]
  - Ensure that when a task is deleted from Taskly.chat, its corresponding event in Google Calendar is also automatically removed.
    
    *   **Acceptance Criteria:**
        *   Deleting a task in Taskly.chat that has an associated Google Calendar event successfully triggers the deletion of that event from Google Calendar.
- [ ] **Build Google Calendar Integration Settings UI** [Frontend Engineer]
  - Develop the user interface within Taskly.chat's dedicated structured UIs (React with Next.js) that allows users to manage their Google Calendar integration settings.
    
    *   **Acceptance Criteria:**
        *   The UI provides a clear toggle or button to enable/disable Google Calendar integration.
        *   A button or link is available to initiate the Google OAuth flow, redirecting the user as needed.
        *   A dropdown or list displays the user's available Google Calendars (fetched from the backend) for them to select which calendar Taskly.chat should use.
        *   The user's current integration status and selected calendar are clearly displayed.
        *   The UI is responsive and provides a seamless user experience.
- [ ] **Design Google Calendar Integration Settings** [UX/UI Designer]
  - Create wireframes and high-fidelity mockups for the Google Calendar integration settings page or section within Taskly.chat's structured user interface.
    
    *   **Acceptance Criteria:**
        *   Designs clearly illustrate the user flow for enabling and disabling the Google Calendar integration.
        *   Designs include the visual elements and interaction patterns for initiating the OAuth authentication process.
        *   Designs present an intuitive method for users to select a specific Google Calendar from a list.
        *   The design ensures visual consistency with the overall Taskly.chat UI/UX guidelines.

---

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

---

## Story: Receive Contextual Weather Updates

**Description:**
As a user, when I ask Taskly.chat for a reminder or a general query that could benefit from local weather context (e.g., 'Remind me to go for a run tomorrow' or 'What's the weather like?'), I want Taskly.chat to provide relevant weather updates (temperature, conditions, precipitation forecast) for the specified or implied location and date, so I can make informed decisions. The weather information should be concise and integrated naturally into the conversational flow. If no location is specified, Taskly.chat should use my default location (from persistent memory or IP-based). If a specific date is mentioned for a reminder, the weather should be for that date. If I ask for the weather for a specific city, it should provide it and update my default location in persistent memory.

### Tasks

- [ ] **Integrate External Weather API** [Backend Engineer]
  - Implement the necessary backend services to connect with a third-party weather API (e.g., OpenWeatherMap, AccuWeather). This involves:
    *   Researching and selecting a suitable weather API.
    *   Implementing an API client in Node.js/NestJS to handle requests and responses.
    *   Defining internal data models for weather information (temperature, conditions, forecast).
    *   Managing API keys and ensuring secure access.
    *   Implementing robust error handling for API failures and rate limits.
- [ ] **Develop Weather Data Abstraction Service** [Backend Engineer]
  - Create a dedicated NestJS service that abstracts the direct calls to the external weather API. This service should:
    *   Provide methods to fetch current weather conditions for a given location.
    *   Provide methods to fetch weather forecasts for a specific location and date.
    *   Implement caching mechanisms using Redis to reduce redundant API calls and improve response times for frequently requested locations/dates.
    *   Return standardized weather data payloads to the AI/NLP layer.
- [ ] **Enhance NLP for Location and Date Extraction** [AI/NLP Engineer]
  - Improve Taskly.chat's natural language understanding capabilities to accurately extract location and date information from user queries. This includes:
    *   Training or fine-tuning models (e.g., spaCy, Hugging Face Transformers) to recognize cities, regions, and other geographical entities.
    *   Implementing robust date/time parsing logic to interpret relative terms like 'tomorrow,' 'next week,' 'in three days,' as well as explicit dates.
    *   Handling ambiguous or incomplete location/date mentions, flagging them for potential clarification or fallback mechanisms.
- [ ] **Implement Contextual Weather Integration Logic** [AI/NLP Engineer]
  - Develop the AI/NLP logic responsible for determining when weather information is relevant and how to integrate it. This task involves:
    *   Creating LangChain agents or custom logic to identify user intents that could benefit from weather context (e.g., planning outdoor activities, general weather queries).
    *   Orchestrating calls to the Weather Data Abstraction Service based on extracted location and date.
    *   Formulating concise and natural language responses that embed the weather information seamlessly into the conversational flow.
    *   Defining rules for when to provide current weather vs. a forecast.
- [ ] **Manage User Default Location in Persistent Memory** [AI/NLP Engineer]
  - Implement the functionality to store, retrieve, and update a user's default location. This requires:
    *   **Backend Engineer**: Extending the PostgreSQL database schema for user profiles to include a 'default_location' field. Developing API endpoints for users to explicitly set or update their default location.
    *   **AI/NLP Engineer**: Integrating logic to automatically use the user's stored default location when no specific location is provided in a query.
    *   **AI/NLP Engineer**: Implementing logic to detect when a user explicitly asks for weather in a new city and, if appropriate (e.g., confirmed by the user), update their persistent default location.
- [ ] **Implement IP-based Location Fallback** [AI/NLP Engineer]
  - Develop a fallback mechanism to determine a user's approximate location if no explicit or default location is available. This includes:
    *   **Backend Engineer**: Integrating a service (internal or external API) to resolve a user's IP address to a geographical location.
    *   **AI/NLP Engineer**: Incorporating this IP-based location into the weather context logic as a last resort when location extraction fails or is absent.
- [ ] **Design Conversational Weather Presentation** [UX/UI Designer]
  - Define the user experience and interface guidelines for presenting weather information within the Lobe-chat conversational interface. This involves:
    *   Specifying how temperature, conditions, and precipitation forecasts should be formatted for brevity and readability.
    *   Determining the natural language phrasing and tone for integrating weather updates into different conversational contexts.
    *   Ensuring the presentation is consistent with Taskly.chat's overall conversational UI/UX principles.
- [ ] **Integrate Weather Responses into Lobe-chat UI** [Frontend Engineer]
  - Implement the frontend logic to display the AI-generated weather responses within the Lobe-chat interface. This task includes:
    *   Consuming the structured weather data or natural language responses from the backend.
    *   Rendering the weather information dynamically and naturally within the chat bubbles or as small, integrated cards, adhering to the designs provided by the UX/UI Designer.
    *   Ensuring responsiveness and consistent display across different devices.

---

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

---

## Story: Add Shopping List Item via Conversation

**Description:**
As a user, I want to add items to a shopping list through natural language (e.g., 'Add bread and eggs to my shopping list'), so Taskly.chat organizes these items into a dedicated shopping list accessible via the structured UI. If I ask for an item that is already on the list, Taskly.chat should ask for confirmation if I want to add it again, or if I meant to update the quantity (for MVP, only adding again). The AI should not create multiple entries for the same shopping item unless explicitly requested to. If I say 'Add 2 liters of milk to shopping list', it will add 'milk' twice. If I say 'I need to buy milk', it will ask for clarification as described in story 'e98e211e-2d93-4a0b-8d00-34a946e30b35'. If I say 'Add milk to shopping list on Monday', it should add it to the shopping list and also create a reminder for Monday.

### Tasks

- [ ] **Develop NLU for Shopping List Item Extraction and Quantity Recognition** [AI/NLP Engineer]
  - Develop and configure the NLP model (using spaCy, Hugging Face Transformers) to accurately process natural language inputs for shopping list items. This task includes:
    *   **Intent Recognition**: Identify user utterances indicating a desire to add items to a shopping list.
    *   **Item Extraction**: Accurately extract specific item names (e.g., "bread", "eggs", "milk") from the conversational input.
    *   **Quantity Recognition**: Detect and parse explicit quantities associated with items (e.g., "2 liters of milk" should result in quantity 2 for "milk").
    *   **Date/Time Extraction**: Identify and extract any specified dates or times from the input for potential reminder creation (e.g., "on Monday").
- [ ] **Implement Conversational Logic for Shopping List Interactions** [AI/NLP Engineer]
  - Develop the logic within the LangChain/orchestration layer to handle the specific interaction patterns for shopping list additions, including:
    *   **Existing Item Check**: Integrate with the Backend API (`GET /api/shopping-list/items`) to determine if an extracted item already exists in the user's active shopping list.
    *   **Duplicate Item Handling (MVP)**: If an item already exists, formulate a response acknowledging its presence and proceed to add it again, as per the MVP requirement (explicit confirmation prompt is out of scope for MVP).
    *   **Quantity-Based Addition**: Ensure that when a quantity is specified (e.g., "2 liters of milk"), the system orchestrates the Backend call to add the item the specified number of times.
    *   **Ambiguity Detection**: Implement logic to detect ambiguous requests (e.g., "I need to buy milk") and flag them for clarification as described in story 'e98e211e-2d93-4a0b-8d00-34a946e30b35'. (This task focuses on detection, not the full clarification flow).
- [ ] **Orchestrate Backend Calls for Shopping List and Reminder Creation** [AI/NLP Engineer]
  - Implement the orchestration logic to communicate with the appropriate Backend services based on NLU output:
    *   **Shopping List API Integration**: Call the `POST /api/shopping-list/items` endpoint on the NestJS/FastAPI Backend service, passing the extracted item names and their corresponding quantities.
    *   **Reminder API Integration**: If a date/time was extracted, call the internal `POST /api/tasks/reminders` endpoint to create a new reminder associated with the shopping list item.
    *   **Error Handling**: Implement robust error handling for all API calls to the Backend services to ensure graceful degradation and informative feedback.
- [ ] **Design and Implement PostgreSQL Schema for Shopping List** [Backend Engineer]
  - Design and implement the necessary database schema in PostgreSQL for storing shopping list items. This includes:
    *   Creating a `shopping_list_items` table with columns such as `id` (UUID, primary key), `user_id` (UUID, foreign key to users table), `item_name` (TEXT), `quantity` (INTEGER, default to 1), `added_at` (TIMESTAMP WITH TIME ZONE), and `is_purchased` (BOOLEAN, default FALSE).
    *   Establishing a foreign key relationship to the `users` table.
    *   Adding appropriate indices for `user_id` and `item_name` to optimize data retrieval and lookups.
- [ ] **Develop FastAPI Endpoints for Shopping List Management** [Backend Engineer]
  - Develop the core API endpoints using FastAPI for managing shopping list items. This task includes:
    *   **`POST /api/shopping-list/items`**: This endpoint will accept a request body containing a list of items, each potentially with a specified quantity. For each item, the system will insert a new record(s) into the `shopping_list_items` table. If `quantity > 1`, the item should be added `quantity` times. No explicit de-duplication logic is required at this API layer, as the AI/NLP service will dictate when to add duplicates.
    *   **`GET /api/shopping-list/items`**: This endpoint will retrieve and return all active shopping list items for the authenticated user.
    *   Implement user authentication and authorization middleware to secure these endpoints.
- [ ] **Develop Task Management Service API for Reminder Creation** [Backend Engineer]
  - Develop an internal API endpoint within the NestJS Task Management service specifically for creating date-based reminders. This task includes:
    *   **`POST /api/tasks/reminders`**: This endpoint will accept parameters such as `user_id`, `description` (e.g., "Buy milk"), `due_date`, and `source` (e.g., "shopping_list").
    *   Persist the received reminder data into the `reminders` table in PostgreSQL.
    *   This task focuses solely on the creation and persistence of the reminder data; the actual delivery mechanism (e.g., via Google Calendar or email) is out of scope for this particular story.
- [ ] **Implement Dedicated Shopping List UI Component** [Frontend Engineer]
  - Develop a dedicated structured user interface component in React/Next.js for displaying and managing the user's shopping list. This task involves:
    *   **Component Development**: Create a new React component, e.g., `ShoppingListView`, responsible for rendering the shopping list.
    *   **API Integration**: On component mount or relevant lifecycle events, make a call to the `GET /api/shopping-list/items` Backend endpoint to fetch the user's current shopping list data.
    *   **Data Display**: Render the fetched items in a clear and intuitive list format. Each item should display its name, and potentially its quantity if applicable (though for MVP, adding 'milk' twice for '2 liters of milk' means it's two separate entries).
    *   **User Experience**: Ensure the UI is responsive, accessible, and aligns with Taskly.chat's established design system and user experience guidelines.

---

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

---

## Story: Capture Tasks via Email

**Description:**
As a user, I want to send an email to a specific Taskly.chat address with task details (e.g., subject 'Reminder: Call Mom', body 'Ask about dinner plans'), so Taskly.chat processes the email content to create a new task or reminder. The system should intelligently extract the task title, due date (if specified), and description from the email. Taskly.chat should then send an email confirmation back to the user to confirm the task has been created. If the email includes a date/time for the reminder, it should create a date-based reminder. If the email subject or body contains phrases like 'add to shopping list', it should create a shopping list item. If the email contains 'track habit', it should confirm the habit and its update, and add it to the habit tracker. If the AI cannot understand the email content, it should reply to the user via email and ask for clarification. The email address to send to Taskly.chat will be unique for each user for security and authentication purposes.

### Tasks

- [ ] **Setup Inbound Email Service and Processing Pipeline** [Backend Engineer]
  - Configure and implement the necessary infrastructure to receive and process inbound emails for Taskly.chat.
    *   Set up AWS SES (Simple Email Service) for receiving incoming emails.
    *   Configure an SNS topic to receive notifications for new incoming emails.
    *   Develop and deploy an AWS Lambda function (or similar serverless component) to consume SNS notifications.
    *   The Lambda function should parse raw email content and store it temporarily for further processing (e.g., in S3 or a message queue like SQS).
- [ ] **Develop User-Specific Email Address Generation and Mapping** [Backend Engineer]
  - Implement the core logic for assigning and managing unique email addresses for each user.
    *   Develop logic to generate unique and secure email addresses for each Taskly.chat user (e.g., `[user-uuid]@[inbox.taskly.chat]` or similar).
    *   Create a database schema and corresponding API endpoints to securely map these unique email addresses to specific user accounts in PostgreSQL.
    *   Implement authentication and authorization mechanisms to ensure that emails sent to a user's unique address are correctly associated with their account.
- [ ] **Develop AI Model for Task Entity Extraction from Email** [AI/NLP Engineer]
  - Design, train, and integrate an NLP model capable of extracting key task details from email subjects and bodies.
    *   Develop or fine-tune an NLP model (using spaCy, Hugging Face Transformers, or LangChain) for Named Entity Recognition (NER).
    *   The model should identify and extract:
        *   Task title/name
        *   Detailed task description
        *   Due dates and times (including relative dates like 'tomorrow', 'next week')
    *   Define confidence thresholds for successful extraction and handling of ambiguous or missing entities.
- [ ] **Develop AI Model for Task Intent Classification from Email** [AI/NLP Engineer]
  - Create an AI model to classify the user's intent from the email content, determining the type of action required.
    *   Develop or fine-tune a text classification model to categorize the email's intent into:
        *   Date-based reminder/task
        *   Shopping list item
        *   Habit tracking update
        *   Unclear/Ambiguous intent
    *   Identify specific keywords, phrases, and sentence structures that indicate each task type (e.g., 'add to shopping list', 'track habit', 'reminder:').
    *   Implement a confidence score for classification, flagging low-confidence results for clarification.
- [ ] **Extend Task Management Service for Email-Initiated Task Creation** [Backend Engineer]
  - Modify and extend the Node.js/NestJS Task Management Service to handle the creation and updating of various item types based on parsed email data.
    *   Create dedicated API endpoints to receive structured data from the AI/NLP processing service.
    *   Implement logic within these endpoints for:
        *   Creating new tasks/reminders, including setting due dates based on extracted information.
        *   Adding new items to a user's shopping list.
        *   Recording updates or confirmations for existing user habits in the habit tracker.
    *   Ensure robust data validation and error handling for incoming task data.
- [ ] **Implement Outbound Email Service for Confirmations and Clarifications** [Backend Engineer]
  - Develop and integrate a service for sending automated email responses back to the user.
    *   Set up AWS SES for sending emails from Taskly.chat to user email addresses.
    *   Create a dedicated email service module/component that can compose and send different types of emails:
        *   Confirmation emails for successful task/reminder creation.
        *   Confirmation emails for shopping list item additions.
        *   Confirmation emails for habit updates.
        *   Clarification request emails when the AI cannot understand the email content, prompting the user for more details.
    *   Ensure these emails are sent to the original sender's email address.
- [ ] **Implement Email Processing Workflow Orchestrator** [Backend Engineer]
  - Develop the core orchestration service that ties together email ingestion, AI processing, task creation, and email responses.
    *   Create a new FastAPI (Python) or NestJS (Node.js) service, or integrate this logic into an existing service, to manage the end-to-end workflow.
    *   This orchestrator will:
        *   Receive processed raw email content from the ingestion pipeline.
        *   Call the AI/NLP service for entity extraction and intent classification.
        *   Based on the AI/NLP output, call the appropriate endpoints in the Task Management Service to create/update tasks, shopping list items, or habits.
        *   Trigger the outbound email service to send either a confirmation or a clarification email back to the user.
    *   Implement comprehensive logging, error handling, and retry mechanisms for each step of the workflow.
- [ ] **Update PostgreSQL Database Schema for Email-Captured Data** [Backend Engineer]
  - Design and implement necessary database schema changes to support the new features.
    *   Extend the `tasks` table with a `type` column (e.g., 'reminder', 'shopping_list_item', 'habit_update') to differentiate items.
    *   Create a new table `user_inbound_emails` to store the mapping of unique inbound email addresses to `user_id`.
    *   Potentially create separate tables for `shopping_list_items` and `habit_entries` if their data structure deviates significantly from a generic task.
    *   Add an `email_logs` table to audit inbound email processing (status, timestamps, associated task_id, etc.).

---

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

---

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

---

## Story: Manage Persistent Memory Settings (Structured UI)

**Description:**
As a user, I want a dedicated section within Taskly.chat's structured UI where I can view, edit, and manage the information stored in my persistent memory (e.g., my preferred weather location, list of known contacts, common routines, explicit preferences), so I have control over what Taskly.chat remembers about me. This UI should allow me to add, update, or remove entries from my persistent memory. For example, I should be able to manually add a contact, specify a new default weather location, or delete a shopping item that is no longer relevant.

### Tasks

- [ ] **Define Persistent Memory Schemas & Categories** [Product Manager]
  - Outline the initial data structures and categories for persistent memory entries. This includes specifying required fields, data types, and example values for each memory type (e.g., 'WeatherLocation' with fields for city/zip, 'Contact' with fields for name/phone/email, 'Routine' with name/time/frequency).
    *   Identify core memory types needed for MVP.
    *   Document schema for each memory type (fields, data types, constraints).
    *   Prioritize which memory types will be manageable via the structured UI in the initial release.
- [ ] **Design Persistent Memory Management UI** [UX/UI Designer]
  - Create wireframes and high-fidelity mockups for the dedicated 'Persistent Memory' section within Taskly.chat's structured UI.
    *   Design the overall layout for viewing, adding, editing, and deleting memory entries.
    *   Develop interaction flows for each CRUD operation.
    *   Specify input fields and UI components for different memory types (e.g., text inputs, dropdowns, date pickers).
    *   Design confirmation dialogs for deletion and success/error notifications.
    *   Ensure responsive design for various screen sizes.
- [ ] **Design Persistent Memory Database Schema** [Backend Engineer]
  - Define the PostgreSQL database tables and relationships required to store persistent memory entries. The schema should be flexible to accommodate different types of memory data.
    *   Create a `persistent_memory` table with fields like `id`, `user_id`, `type` (e.g., 'WeatherLocation', 'Contact'), `value` (JSONB for flexible data storage), `created_at`, `updated_at`.
    *   Ensure proper indexing for efficient querying.
    *   Establish foreign key relationship with the `users` table.
    *   Document the schema design.
- [ ] **Implement Persistent Memory Read API** [Backend Engineer]
  - Develop a NestJS API endpoint to retrieve all persistent memory entries for a specific user.
    *   Endpoint: `GET /api/v1/memory`.
    *   Require user authentication (JWT).
    *   Implement logic to fetch all entries belonging to the authenticated user from the database.
    *   Optionally, allow filtering by `type` (e.g., `GET /api/v1/memory?type=WeatherLocation`).
    *   Return a structured JSON array of memory objects.
- [ ] **Implement Persistent Memory Create API** [Backend Engineer]
  - Develop a NestJS API endpoint to add a new persistent memory entry for a user.
    *   Endpoint: `POST /api/v1/memory`.
    *   Require user authentication (JWT).
    *   Accept `type` and `value` (JSONB) in the request body.
    *   Implement server-side validation based on defined memory schemas.
    *   Store the new entry in the `persistent_memory` table, associating it with the authenticated user.
    *   Return the newly created memory object with its `id`.
- [ ] **Implement Persistent Memory Update API** [Backend Engineer]
  - Develop a NestJS API endpoint to update an existing persistent memory entry for a user.
    *   Endpoint: `PUT /api/v1/memory/:id`.
    *   Require user authentication (JWT).
    *   Accept updated `type` or `value` in the request body.
    *   Implement authorization to ensure the user can only update their own memory entries.
    *   Perform server-side validation on updated data.
    *   Update the corresponding entry in the `persistent_memory` table.
    *   Return the updated memory object.
- [ ] **Implement Persistent Memory Delete API** [Backend Engineer]
  - Develop a NestJS API endpoint to delete a persistent memory entry for a user.
    *   Endpoint: `DELETE /api/v1/memory/:id`.
    *   Require user authentication (JWT).
    *   Implement authorization to ensure the user can only delete their own memory entries.
    *   Remove the specified entry from the `persistent_memory` table.
    *   Return a success status or an empty response on successful deletion.
- [ ] **Integrate UI-Managed Memory into AI/NLP Model Context** [AI/NLP Engineer]
  - Ensure that persistent memory entries added/updated/deleted via the structured UI are accurately reflected and accessible by the AI/NLP models for contextual understanding and response generation.
    *   Modify the AI/NLP pipeline (e.g., LangChain orchestration) to fetch user's persistent memory data (via Backend API or direct DB access) at appropriate stages.
    *   Define the format and structure in which this memory is fed into the language models as part of their context window.
    *   Implement mechanisms to refresh or invalidate cached memory data when changes occur through the structured UI.
    *   Test conversational responses to verify AI utilizes manually updated memory (e.g., asking about weather in a new default location, referencing a newly added contact).
- [ ] **Create Persistent Memory Management Page** [Frontend Engineer]
  - Implement a new Next.js page that serves as the entry point for persistent memory management within the structured UI.
    *   Create a new route (e.g., `/settings/memory`) for the page.
    *   Set up the basic page layout, including header and potential navigation.
    *   Integrate the page into the application's overall navigation structure (e.g., a link in the settings sidebar).
- [ ] **Develop Persistent Memory List Component** [Frontend Engineer]
  - Build a React component to display a list of all persistent memory entries for the authenticated user.
    *   Fetch memory data from the Backend API (`GET /api/v1/memory`) upon component mount.
    *   Render each memory entry, clearly showing its type and value (e.g., 'Weather Location: New York', 'Contact: John Doe, 555-1234').
    *   Include interactive 'Edit' and 'Delete' buttons/icons for each entry.
    *   Implement visual feedback for loading states, empty states, and errors during data fetching.
- [ ] **Develop Add/Edit Persistent Memory Form Components** [Frontend Engineer]
  - Create React components (e.g., modals or expandable forms) for adding new and editing existing persistent memory entries.
    *   Design forms to dynamically adapt input fields based on the selected memory `type`.
    *   Implement client-side validation for form inputs.
    *   Integrate with the Backend APIs (`POST /api/v1/memory` for add, `PUT /api/v1/memory/:id` for edit) upon form submission.
    *   Provide clear success and error messages to the user post-submission.
    *   Ensure forms pre-populate with existing data when editing.
- [ ] **Implement Persistent Memory Deletion Flow** [Frontend Engineer]
  - Implement the UI and associated logic for deleting a persistent memory entry.
    *   When the 'Delete' action is triggered, present a confirmation dialog to the user.
    *   Upon user confirmation, call the Backend API (`DELETE /api/v1/memory/:id`) to remove the entry.
    *   Update the displayed list of memory entries in the UI immediately after successful deletion.
    *   Handle and display any errors that occur during the deletion process.

---


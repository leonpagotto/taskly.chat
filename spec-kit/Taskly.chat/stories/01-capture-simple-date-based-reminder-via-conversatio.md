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

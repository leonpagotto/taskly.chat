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

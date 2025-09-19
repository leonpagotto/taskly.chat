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

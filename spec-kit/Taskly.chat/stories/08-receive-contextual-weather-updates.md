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

## Story: As a user, I want to use my own AI service API key

**Description:**
As a user, I want to be able to securely integrate and use my personal API key for preferred AI services (e.g., OpenAI) within Taskly.chat, ensuring my data is processed via my own account and potentially reducing costs or leveraging specific models.

### Tasks

- [ ] **Implement Secure User API Key Storage and Management** [Backend Engineer]
  - Implement robust backend functionality for securely storing user-provided AI service API keys (e.g., OpenAI). This includes encryption at rest and in transit. Develop API endpoints for users to: * Add a new API key. * View existing keys (masked for security). * Update an existing API key. * Delete an API key. * Each key must be associated with the authenticated user and support validation against the respective AI service upon submission.
- [ ] **Modify AI Service Proxy for Dynamic Key Injection** [Lead AI/ML Engineer]
  - Adapt the core AI service proxy layer to dynamically retrieve and inject a user's personal API key into requests made to external AI providers (e.g., OpenAI) when available and enabled by the user. Ensure a seamless fallback mechanism to the system's default API key if the user has not provided or enabled their own key. Implement comprehensive error handling for issues arising from user-provided keys (e.g., invalid key, rate limits).
- [ ] **Develop User Settings UI for AI Key Management** [Frontend/Conversational UI Developer]
  - Design and implement a new section within the user settings interface on both web and mobile platforms. This section will allow users to: * Input and save their AI service API keys securely. * View their saved keys (masked display). * Edit or delete their keys. * Include a clear toggle or checkbox for users to enable/disable the use of their personal API key for AI interactions. Provide clear visual feedback for successful operations and any validation errors.
- [ ] **Integrate AI Service with Dynamic Key Retrieval** [Lead AI/ML Engineer]
  - Ensure the application's AI integration layer (both frontend and backend components interacting with AI services) is capable of receiving and utilizing user-specific API keys. This involves modifying client-side or server-side AI SDK initializations to accept a dynamically provided key, ensuring all subsequent calls for that user session leverage their chosen key. Validate that AI service calls correctly use the user's key when provided and fall back to the system key otherwise.
- [ ] **Comprehensive Testing for User API Key Feature** [QA Engineer]
  - Develop and execute a comprehensive test plan for the entire user API key management feature. This includes: * **Functional Testing:** Adding, updating, deleting valid/invalid keys, toggling key usage, and verifying AI responses with user vs. system keys. * **Security Testing:** Ensuring API keys are encrypted at rest, transmitted securely, and not exposed in logs or network traffic. * **Error Handling Testing:** Validating appropriate feedback for invalid keys, rate limits, or API service outages. * **Performance Testing:** Ensuring the overhead of dynamic key management does not significantly impact AI response times.
- [ ] **Define UI/UX and Communication Strategy for User API Keys** [Product Manager]
  - Define the final user experience and interface requirements for managing AI service API keys, including mockups and user flows. Develop internal and external communication plans to announce this new feature, highlighting its benefits (e.g., data privacy, cost control, specific models). Prepare any necessary documentation for users on how to obtain and use their API keys.

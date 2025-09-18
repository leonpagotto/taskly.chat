## Story: As a user, I want to use the conversational interface for general queries and text generation

**Description:**
As a user, I want to be able to use Taskly.chat's conversational interface for general knowledge queries or to assist me in writing various texts (e.g., emails), leveraging its AI capabilities beyond task management.

### Tasks

- [ ] **Frontend - Implement General Chat UI Display and Input** [Frontend/Conversational UI Developer]
  - Modify the existing conversational interface to effectively handle and display general chat messages and AI-generated text. This includes adapting the input field for free-form queries and rendering diverse AI responses.
    *   Ensure the chat input field allows for open-ended text entry without specific task-related constraints.
    *   Implement robust display mechanisms for AI responses, including support for basic markdown (e.g., bold, italics, lists) for improved readability of generated texts.
    *   Maintain real-time message exchange responsiveness via WebSockets for a fluid user experience.
- [ ] **Backend - Create General AI Chat Message Routing** [Backend Engineer]
  - Develop or extend backend logic to receive general chat messages from the frontend, route them to the appropriate AI service for processing, and manage the real-time delivery of AI responses back to the user via WebSockets.
    *   Establish a dedicated API endpoint (e.g., "/api/chat/general") to receive user's general text queries.
    *   Implement secure authentication and authorization checks for all incoming chat requests.
    *   Forward the processed user message to the AI/ML service for general text generation or knowledge queries.
    *   Receive the AI's response and efficiently push it to the originating frontend client through a WebSocket connection.
    *   Implement error handling for AI service communication failures or invalid requests.
- [ ] **AI/ML - Configure LLM for General Purpose Conversational AI** [Lead AI/ML Engineer]
  - Integrate and configure the primary LLM (e.g., OpenAI API) to serve general knowledge queries and text generation requests, distinguishing these from task-specific natural language understanding.
    *   Establish and secure API connections to external LLM services (e.g., OpenAI, Google Gemini).
    *   Develop and apply effective prompt engineering strategies to guide the LLM for diverse requests, such as general knowledge explanations, email drafting, or content summarization.
    *   Implement logic to manage and securely store LLM API keys.
    *   Set up monitoring for LLM usage and response quality.
- [ ] **Frontend - Integrate Voice Input for General Queries** [Frontend/Conversational UI Developer]
  - Extend the conversational interface to allow users to input general queries and text generation requests using voice. This involves capturing speech, converting it to text, and submitting it to the chat interface.
    *   Implement a clear and accessible microphone icon or button within the chat input area.
    *   Utilize the Web Speech API (for browser) or a cloud-based Speech-to-Text service (e.g., Google Cloud Speech-to-Text) for accurate speech transcription.
    *   Display the transcribed text in the input field for user review before submission, or directly send it as a chat message.
    *   Provide visual feedback during active voice recording and transcription.
    *   Implement robust error handling for microphone access issues or transcription failures.
- [ ] **QA - Develop Test Plan for General Chat and Text Generation** [QA Engineer]
  - Create a comprehensive test plan and execute test cases to ensure the stability, accuracy, and usability of the general conversational interface and its text generation capabilities.
    *   Develop a suite of test cases covering a wide range of general knowledge questions and text generation prompts (e.g., 'explain quantum physics', 'write a short thank you email', 'summarize this article').
    *   Verify the accuracy, relevance, and coherence of AI-generated responses.
    *   Test the end-to-end flow from user input (text and voice) to AI response display.
    *   Validate correct rendering of markdown and other formatting in AI responses.
    *   Perform performance tests to ensure timely responses from the AI service.
    *   Conduct regression testing to ensure new features do not negatively impact existing task management functionalities.

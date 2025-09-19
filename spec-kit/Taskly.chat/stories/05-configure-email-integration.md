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

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

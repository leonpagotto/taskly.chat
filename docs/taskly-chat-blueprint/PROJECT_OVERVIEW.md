# Project: Taskly.chat Blueprint (v1.0.0)

**Description:** Create a new project specification based on the context from the GitHub repository: https://github.com/leonpagotto/taskly.chat

---

# Specification

## Summary
Taskly.chat is an AI-powered personal assistant, initially leveraging Gemini models and later allowing users to integrate their own AI API keys via a cheap subscription, designed to seamlessly blend conversation, local persistent memory, and intelligent automation with extensive user customization for rules and triggers. It helps users capture, structure, and accomplish everything that matters with enhanced privacy and control, adhering to standard required data privacy and security. Serving as a central hub for both personal and professional tasks, it integrates with popular tools like Google Calendar, Outlook, Slack, Trello, and Asana. Breaking away from traditional rigid productivity tools, Taskly.chat enables natural language interaction, personalized assistance through locally-managed memory, and instruction-driven behavior, ultimately making productivity effortless and meaningful. Taskly.chat will employ a flexible monetization strategy, including a Free tier for basic use, a "Cheap AI Tier" for price-sensitive users needing unlimited lightweight AI, a "Pro Tier" for advanced AI models and collaboration, and a "One-Time Fee Tier" for non-subscription users, alongside an Enterprise option and add-ons. This approach aims to capture a broad user base, from students and hobbyists to power users and enterprises, accessible initially as a web app (mobile-first design) and a desktop app, with Android and iOS versions planned for later release.

### User Personas
- Individuals seeking a unified tool for managing personal life tasks, reminders, and goals, leveraging integrations with calendars like Google Calendar or Outlook. This includes price-sensitive users, students, or hobbyists who can benefit from the Free, Cheap AI, or One-Time Fee tiers, valuing local storage of their personal data, and appreciating the flexibility to eventually use their own AI model keys for enhanced control or cost efficiency, accessible via web and desktop, with future mobile support.
- Professionals who need assistance with work-related tasks like drafting, summarizing, and planning, integrating with their existing workflows in Slack, Trello, or Asana. These users are likely to gravitate towards the Pro Tier for access to premium AI models, advanced planning, and custom automation, desiring fine-grained control over automations, and considering options to manage AI usage costs by providing their own API keys, utilizing the web or desktop application.
- Creative individuals or strategists looking for a tool to brainstorm ideas and structure plans, and to coordinate with team members through shared platforms, benefiting from custom automation rules and the power of flexible AI models. They may opt for the Pro Tier to access advanced reasoning capabilities, accessible across web and desktop.
- Teams or collaborators who require a shared space for projects with consistent AI-driven assistance, facilitating seamless collaboration across integrated tools like Slack, Trello, and Asana, needing customizable team-wide automations. Larger teams will find value in the Enterprise Tier, while smaller teams might utilize Pro Tier collaboration features, all while valuing the potential for cost-effective AI model integration, available on web and desktop.
- Users who prioritize data privacy and local control over their personal information, seeking an AI assistant that stores their persistent memory on their own device. They value the ability to define custom automation logic, and desire transparency and control over the AI models used, potentially through their own API key integration, leveraging its web and desktop presence across all available tiers (Free, Cheap AI, Pro, One-Time, Enterprise), with the assurance of standard required data privacy and security measures.

### Features
- Flexible AI Model Integration: Initially powered by Gemini models, with future plans to enable users to integrate their own AI API keys via a cheap subscription, offering enhanced control and cost management for their AI interactions. Different tiers will offer access to various AI model capabilities (e.g., lightweight models in Cheap AI Tier, premium models in Pro Tier).
- Conversation-centric interface where all interactions start with natural chat, automatically organizing user intent, leveraging advanced AI models like Gemini for natural language understanding and generation.
- Local persistent personal memory that remembers preferences, routines, priorities, and important dates, maintaining continuous and personalized context stored securely on the user's device, offering enhanced privacy and potentially offline access to memory content.
- User-defined persistent instructions and guidance that can apply globally or per project space, influencing AI output.
- Smart automations including context-aware reminders, nudges, insights, and the ability to track progress, habits, or events, with user-defined custom rules and conditional triggers.
- Seamless integration with key third-party applications including Google Calendar, Outlook, Slack, Trello, and Asana to surface relevant information and synchronize workflows. Premium integrations (e.g., GitHub, Jira, Notion) will be available in higher tiers.
- Designed to balance and handle both personal and professional contexts within a single space.
- Optional collaboration features allowing users to share projects or threads with others, ensuring consistent AI-generated output for teams, available in Pro and Enterprise Tiers.
- Multi-platform availability: Launching first as a web application (with a mobile-first design) and a desktop application, with plans for Android and iOS native apps in subsequent phases.
- Flexible Monetization Strategy: Offers a Free tier for basic usage, a 'Cheap AI Tier' for unlimited lightweight AI for price-sensitive users, a 'Pro Tier' for advanced AI models, collaboration, and premium integrations, a 'One-Time Fee Tier' for non-subscription users, and an 'Enterprise Tier' with dedicated workspace, admin tools, security, and priority support. Optional add-ons like AI credit packs and premium workflow templates will also be available.
- Standard Data Privacy and Security: Implements industry-standard measures for data privacy, security, and user control over personal data and memory, ensuring compliance with relevant regulations and user expectations.


---

# Constitution

## Principles
- Enable effortless and meaningful productivity through intelligent, AI-powered assistance.
- Prioritize user privacy and control by enabling local persistent memory and flexible AI model integration.
- Foster seamless integration with existing personal and professional workflows via key third-party applications.
- Offer extensive user customization for personalized and instruction-driven AI behavior.
- Ensure accessibility and value across a broad user base through flexible monetization and multi-platform presence.

## Values
- User Empowerment: Providing tools for users to control their data, AI models, and workflow automations.
- Privacy-by-Design: Implementing local data storage and adhering to standard required data privacy and security measures.
- Seamless Integration: Connecting with widely used tools to enhance user productivity and workflow synchronization.
- Adaptability: Supporting diverse user needs, contexts (personal/professional), and monetization preferences.
- Innovation: Leveraging advanced AI to create intuitive, intelligent, and context-aware automation.
- Clarity and Control: Offering clear user-defined rules, conditional triggers, and persistent instructions for AI behavior.

## Constraints
- Initial AI models must be Gemini, with a clear roadmap for enabling user-provided AI API keys via a cheap subscription.
- User's persistent memory must be stored locally on their device to enhance privacy and control.
- Initial product launch must include a web application (mobile-first design) and a desktop application.
- Native Android and iOS applications are to be developed in subsequent phases, not for initial launch.
- All data handling and storage must comply with standard required data privacy and security measures.
- Monetization strategy must include Free, Cheap AI, Pro, One-Time Fee, and Enterprise tiers, plus optional add-ons.
- Core third-party integrations (Google Calendar, Outlook, Slack, Trello, Asana) are mandatory for initial release, with premium integrations for higher tiers.
- Use Lobe-chat (https://github.com/lobehub/lobe-chat) framework to speed up development and make use of its functionalities out of the box

## Team Roles
- **Product Manager:** Define product vision, strategy, and roadmap; gather user requirements; manage feature prioritization and monetization strategy across all tiers.
- **AI/ML Engineer:** Integrate and optimize AI models (Gemini, user-provided); develop natural language understanding and generation capabilities; implement intelligent automation logic and context awareness.
- **Backend Developer:** Design and implement core API services and third-party integrations; manage data storage solutions for local persistent memory; ensure data security, privacy, and backend performance; develop collaboration features.
- **Frontend Developer (Web & Desktop):** Build the multi-platform user interface for web and desktop applications; ensure mobile-first design for the web app; implement conversation-centric interface and user customization options.
- **UI/UX Designer:** Create intuitive and engaging user experiences across all platforms; design the conversation flow, memory management, and automation setup; develop wireframes, mockups, and prototypes.
- **QA Engineer:** Develop and execute test plans for all features, integrations, and platforms; identify and report bugs; ensure high quality, reliability, and compliance with privacy/security requirements.
- **DevOps Engineer:** Manage infrastructure, deployment pipelines, and scaling solutions; implement monitoring and logging systems; ensure robust security measures, performance, and reliability across environments.


---

# Plan

## Architecture
Taskly.chat will employ a modular, multi-tier architecture to support its diverse features, multi-platform presence, and flexible monetization strategy. The frontend will consist of a Web Application (mobile-first design) and a Desktop Application (Electron-based), both built using the Lobe-chat framework for a consistent conversational UI. These clients will manage local persistent memory using client-side storage mechanisms (e.g., IndexedDB, SQLite for Electron) to ensure user privacy and control. A robust backend will provide core services including an API Gateway, User Management, AI Integration, Third-Party Integration, and an Automation Engine. The AI Integration Service will initially proxy requests to Gemini models and later facilitate the use of user-provided AI API keys. The Third-Party Integration Service will handle OAuth flows and data synchronization with external tools. A dedicated Subscription & Billing Service will manage the various monetization tiers (Free, Cheap AI, Pro, One-Time Fee, Enterprise) and add-ons. Server-side data will be stored in a cloud-based database for user profiles, subscription data, and encrypted integration credentials, while personal memory will remain client-local. The infrastructure will be cloud-native, designed for scalability and high availability, utilizing containerization for deployment.

## Tech Stack
Frontend (Web & Desktop): React/Next.js (leveraging Lobe-chat framework), Electron (for desktop app). Programming Language (Backend): TypeScript with Node.js. Backend Framework: NestJS. Databases: PostgreSQL (for server-side relational data), IndexedDB/SQLite (for client-side local persistent memory). AI Models: Gemini API (initial), integration with other LLM APIs (e.g., OpenAI, Anthropic) for user-provided keys. Cloud Platform: AWS (or GCP/Azure) for backend services, S3/CDN for frontend assets. Authentication: OAuth2, JWT. Payment Gateway: Stripe/Paddle. Containerization: Docker, Kubernetes. Version Control: Git.

## Non-Functional Requirements
Performance: Ensure low latency for AI interactions (sub-500ms for common queries) and responsive UI across web and desktop platforms. Scalability: Backend services must be designed to scale horizontally to support millions of users and high concurrency, especially for AI and integration requests. Security: Implement industry-standard security measures including data encryption at rest and in transit, secure API key management (for user-provided AI keys and third-party integrations), robust authentication and authorization mechanisms, and regular security audits. Privacy: Guarantee local storage of persistent user memory. Adhere to all standard required data privacy regulations (e.g., GDPR, CCPA), provide clear user consent mechanisms, and enable robust data control features (export, deletion). Reliability: Achieve high availability (e.g., 99.9% uptime for core services) with robust error handling, monitoring, and automated recovery mechanisms. Maintainability: Develop with clean code principles, comprehensive documentation, and a modular architecture to facilitate future enhancements and bug fixes. Usability: Deliver an intuitive, conversation-centric user experience with a mobile-first design approach for the web app, ensuring consistency across all platforms. Extensibility: The architecture should allow for easy addition of new AI models, third-party integrations, and flexible monetization features without significant re-engineering.


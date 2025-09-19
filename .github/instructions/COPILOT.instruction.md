# Copilot Instructions for Taskly.Chat

This document provides context for AI assistants like GitHub Copilot to better understand the project goals and architecture.

## Project Summary
Taskly.chat is an AI-powered personal assistant that blends conversation, memory, and automation, designed to align with natural human thought and communication. It serves as a comprehensive companion for both personal and professional life, transforming informal ideas, reminders, and goals into structured actions through natural language interaction. Its vision is to be the central hub for managing all aspects of a user's life, making productivity effortless, meaningful, and balanced by leveraging intelligent assistance and persistent memory.

## Architecture
The Taskly.chat system will adopt a modular, microservices-based architecture to ensure scalability, maintainability, and flexibility. A client-side application (web and potentially mobile) will interact with a secure API Gateway. Behind the gateway, specialized microservices will handle distinct functionalities: a Conversational AI Service for natural language processing and LLM interaction; a Memory Management Service for persistent user context and preferences; an Automation & Reminders Service for intelligent nudges and scheduling; an Integration Service for connecting with third-party applications; and a User & Collaboration Service for user authentication, authorization, and project sharing. Data persistence will leverage a combination of relational databases (e.g., PostgreSQL) for structured user and project data, a vector database (e.g., Pinecone) for efficient AI memory retrieval, and potentially NoSQL databases for conversation history. Asynchronous communication between services will be managed via a message queue (e.g., Kafka or RabbitMQ) to ensure responsiveness and resilience.

## Tech Stack
Frontend: React (Web SPA) with potential for React Native (Cross-platform Mobile) to ensure a consistent and responsive user experience. Backend: Python (for AI/ML heavy services leveraging libraries like LangChain, Hugging Face, OpenAI API) and Node.js (for I/O bound services, API Gateway, and general microservices) to balance AI capabilities with high-performance async operations. Databases: PostgreSQL (for core relational data like user profiles, projects, permissions), Pinecone/Weaviate (for vector-based memory storage to enable contextual retrieval for AI), and Redis (for caching, session management, and message queueing). Cloud Platform: AWS/Azure/GCP for scalable infrastructure, managed services, and compute resources. Containerization: Docker and Kubernetes for efficient deployment and orchestration of microservices. Other: OAuth2.0 for secure third-party integrations, WebSockets for real-time interactions if required.

## Project Structure (File-Based)

This project's data is stored in a structured directory format, making it portable and Git-friendly. The main project folder is `docs/taskly-chat`.

- **`project-version.json`**: Contains top-level metadata: the project specification, constitution, architecture, and tech stack.
- **`stories/`**: This directory contains a subdirectory for each user story.
- **`.../[story-name]/story.md`**: The markdown file for a specific story, containing its title, description, and priority in YAML frontmatter.
- **`.../[story-name]/[status]/[task-id].md`**: Each task is a markdown file within a status folder (e.g., `Backlog`, `InProgress`). The file contains task details in its frontmatter and description.

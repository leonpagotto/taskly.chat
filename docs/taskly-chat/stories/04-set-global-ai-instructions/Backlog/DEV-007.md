# Task: DEV-007
Status: Backlog
Story: 04-set-global-ai-instructions
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Migrated legacy task. Improve this summary.

## Acceptance Criteria
- [ ] Define criteria

## Implementation Notes
- Migrated by normalize-tasks script

## Progress Log
- 2025-09-19 Normalized legacy file

## Legacy Body

---
id: DEV-007
title: Develop Backend API for Global AI Instructions
responsibleArea: Full-stack Software Engineer
---
Create a new API endpoint to handle CRUD operations for a user's global AI instructions, ensuring security and data integrity.
*   **API Endpoint Definition:** Design and implement a RESTful API endpoint (e.g., `/api/user/ai-settings`) for global AI instructions.
*   **Schema Definition:** Define the JSON request/response schema for instruction data (e.g., `preferredTone`, `defaultDetailLevel`, `customInstructions`).
*   **CRUD Operations:** Implement `GET` (retrieve user's instructions), `PUT` (update user's instructions), and potentially `DELETE` functionalities.
*   **Authentication & Authorization:** Secure the endpoint using OAuth2.0 to ensure only authenticated and authorized users can access/modify their settings.
*   **Server-side Validation:** Implement robust validation for all incoming instruction data to prevent malformed or malicious inputs.
*   **Error Handling:** Provide clear and informative API error responses.

# Task: IMP-017
Status: backlog
Story: 09-manage-project-specific-ai-instructions
Created: 2025-09-19
Type: chore
Related:
Owner:

## Summary
Implement Retrieval of Project AI Instructions for AI Model Context

## Acceptance Criteria
- [ ] The AI service successfully calls the backend API (`GET /api/projects/{projectId}/ai-instructions`) to fetch the relevant instructions when a project context is detected.
- [ ] The retrieved instructions are correctly formatted and appended to the AI model's prompt or context window for subsequent processing.
- [ ] Robust error handling is implemented for cases where instructions cannot be retrieved or are malformed.

## Implementation Notes
- Migrated by normalize-tasks script

Auto-upgraded from legacy placeholder via upgrade-legacy-tasks script.

## Progress Log
- 2025-09-19 Normalized legacy file

## Migration Note
Upgraded in-place; original legacy body retained below.

## Legacy Body
---
id: IMP-017
title: Implement Retrieval of Project AI Instructions for AI Model Context
responsibleArea: AI/Machine Learning Engineer
---
Modify the AI service to dynamically retrieve and incorporate project-specific AI instructions when processing any request that originates from or is relevant to a particular project.

*   **Acceptance Criteria:**
    *   The AI service successfully calls the backend API (`GET /api/projects/{projectId}/ai-instructions`) to fetch the relevant instructions when a project context is detected.
    *   The retrieved instructions are correctly formatted and appended to the AI model's prompt or context window for subsequent processing.
    *   Robust error handling is implemented for cases where instructions cannot be retrieved or are malformed.
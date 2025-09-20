<!-- Generated/Normalized from template on 2025-09-20 -->
# Story: 09-manage-project-specific-ai-instructions

## Summary
Support per-project AI instruction layers overriding or extending global defaults for tailored collaboration.

## Motivation
Need differentiated tone/behavior across distinct project contexts.

## Desired Outcomes
- Project instruction editor.
- Merge logic respects precedence.

## Scope
In Scope:
- Storage + retrieval per project.

Out of Scope (Initial):
- Version diff UI.

## Success Metrics
- Projects with custom instructions adoption.

## Risks
- Confusing override precedence.

## Assumptions
- Project layer sits above global.

## Open Questions
1. Conflict resolution strategy?

## Related Stories / Tasks
- story-007 global instructions.

## Narrative Notes
Layer merging algorithm minimal first.

## Progress Log
- 2025-09-20 Narrative scaffold added.
Created: 2025-09-19
Owner: 
Area: general

Status: Draft
---
id: b3c4d5e6-a1b2-c3d4-e5f6-7a8b9c0d1e2f
title: Manage Project-Specific AI Instructions
priority: Medium
---
As a user, I want to define specific instructions for the AI within individual projects (e.g., 'Draft meeting minutes in bullet points'), so its output is tailored to the project's goals and context.

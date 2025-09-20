<!-- Generated/Normalized from template on 2025-09-20 -->
# Story: 12-define-collaboration-permissions

## Summary
Establish permission model defining roles, scopes, and allowed actions for shared workspaces.

## Motivation
Secure collaboration requires scoped access.

## Desired Outcomes
- Role definitions stable.
- Enforcement at API.

## Scope
In Scope:
- Basic roles & checks.

Out of Scope (Initial):
- Fine-grained per-field permissions.

## Success Metrics
- Unauthorized action attempts blocked.

## Risks
- Overly rigid model blocks usage.

## Assumptions
- 3 role tiers suffice early.

## Open Questions
1. Need temporary guest access?

## Related Stories / Tasks
- story-010 sharing.

## Narrative Notes
Design for extension (labels or capabilities map).

## Progress Log
- 2025-09-20 Narrative scaffold added.
Created: 2025-09-19
Owner: 
Area: collaboration

Status: Draft
---
id: 6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d
title: Define Collaboration Permissions
priority: Medium
---
As a user sharing a project, I want to define specific roles and permissions (e.g., read-only, edit, administer) for collaborators, so I can control access to my shared content.

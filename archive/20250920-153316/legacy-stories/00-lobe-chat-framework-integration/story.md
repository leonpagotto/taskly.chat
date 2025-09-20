# Story: Lobe Chat Framework Integration
Slug: 00-lobe-chat-framework-integration
Status: draft
Created: 2025-09-19
Owner: 
Area: general

## Goal
Adopt Lobe Chat components/state management in a way that accelerates delivery of natural language task creation and future memory/instructions features.

## Plan (Initial)
1. Feasibility Assessment: Determine correct install method (npm package(s) vs git subpath) & licensing review.
2. Minimal Mount: Replace custom `ChatShell` with Lobe Chat base component wrapper.
3. Extension Points: Identify injection spots for instruction layers, task draft extraction, and memory context.
4. Theming & UI Adaptation: Align visuals with Taskly brand (light pass initially).
5. Abstraction Layer: Provide an adapter module wrapping Lobe Chat events into our domain events (message persisted, draft tasks derived, memory refs used).
6. Performance & Bundle Review: Tree-shake or code-split if footprint is large.
7. Documentation: Update architecture to reflect framework adoption boundaries and avoidance of direct modification (favor composition).

## Governance Reference
Task creation, naming, promotion, and uniqueness rules are defined in `docs/TASKS-GUIDELINES.md` (global unique IDs, filename/header consistency, backlog vs pipeline separation). Integration tasks (ANL-100 .. MEM-109) adhere to those conventions.

## Dependencies
- Must precede: Story 01 (Natural Language Task Creation) to avoid duplicative UI build.

## Out of Scope
- Full theming system overhaul
- Custom plugin marketplace features from Lobe Chat not needed initially

---

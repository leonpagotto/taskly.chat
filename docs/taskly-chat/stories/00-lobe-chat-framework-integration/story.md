---
id: 0d-framework-001
title: Lobe Chat Framework Integration
priority: High
---
As a developer, I need Taskly.chat to integrate the Lobe Chat framework (or its consumable modular subset) so that we leverage existing robust chat UI, session management, and extensibility points rather than re-building foundational chat capabilities from scratch.

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

## Dependencies
- Must precede: Story 01 (Natural Language Task Creation) to avoid duplicative UI build.

## Out of Scope
- Full theming system overhaul
- Custom plugin marketplace features from Lobe Chat not needed initially

---

# 🤖 Copilot Instructions (Unified)

_Last updated: 2025-09-19_

This unified guide combines project context (vision, architecture, structure) with governance rules (spec → plan → tasks workflow) for any AI assistant or Copilot operating in this repository. Treat this document as the authoritative contract. If an instruction conflicts with these rules, escalate before proceeding.

---
## 1. Project Vision Summary
Taskly.chat is an AI-powered personal assistant blending conversation, persistent memory, and intelligent automation. It turns informal thoughts (ideas, reminders, goals) into structured, trackable actions via natural language. Long-term, it aims to be the central hub for managing life domains—personal and professional—offering proactive, context-aware support that keeps productivity meaningful and balanced.

---
## 2. High-Level Architecture (Conceptual)
- **Client Layer**: Web (React / Next.js) and future Mobile (React Native) for conversational + task UX.
- **API Gateway**: Unified ingress for authentication, routing, and request shaping.
- **Core Services**:
  - Conversational AI Service (LLM orchestration, instruction grounding, memory retrieval)
  - Memory Management Service (vector + structured memory persistence)
  - Automation & Reminders Service (scheduling, nudges, temporal reasoning)
  - Integration Service (third‑party APIs: calendar, tasks, communication tools)
  - User & Collaboration Service (accounts, permissions, sharing, roles)
- **Data Layer**:
  - Relational DB (PostgreSQL) for canonical user, project, task, permission data
  - Vector Store (Pinecone / Weaviate) for semantic memory retrieval
  - Redis (caching, ephemeral session/context, possibly queue)
  - (Optional) NoSQL / blob storage for conversation transcripts & artifacts
- **Async Backbone**: Message queue or streaming bus (Kafka / RabbitMQ) for decoupled events and workflows.
- **Observability**: Logging, tracing, metrics (future add-on).

---
## 3. Core Tech Stack (Planned / Emerging)
- Frontend: React / Next.js (current), future React Native
- Backend: Node.js (service + gateway), Python (AI-heavy or model tooling)
- AI: OpenAI / local adapters, embedding + retrieval pipeline
- Infra: Docker + potential Kubernetes for multi-service deployment
- Auth: OAuth2.0 / OIDC, future granular permission model
- Realtime: WebSockets (conversation streaming, task updates)

---
## 4. Repository Knowledge Model (File-Based Process)
Primary domain knowledge and workflow artifacts live under: `docs/taskly-chat/`
Primary domain knowledge and workflow artifacts live under: `docs/`
- `stories/<number>-<slug>/story.md` → Story root specification
- `stories/<number>-<slug>/Backlog/` → Story-scoped ideation tasks
- Global task pipeline: `tasks/{todo,in-progress,review,done}/` (single canonical flow)
- `docs/SPEC-INDEX.md` (auto-generated) → Catalog of backlog counts + pipeline snapshot

Story numbering is ascending; slugs are stable. Tasks are single markdown files whose location (folder) = state.

5. Global pipeline folders are the single source of truth for active Task state (`tasks/*`). Story Backlog holds only unpulled tasks.
6. Only Task files move; Story roots (`story.md`) and constitutional/reference docs remain stationary.
6. Only Task files move; Story roots (`story.md`) and reference docs remain stationary.
---
## 5. Golden Governance Rules
- Specs & Stories: `stories/*/story.md`
- Story Backlog Tasks: `stories/*/Backlog/*.md`
- Active Tasks: `tasks/{todo,in-progress,review,done}/*.md`
- Process Reference: `docs/PROCESS.md`
- Copilot Context: `.github/instructions/COPILOT.instructions.md`
5. Folder path = single source of truth for Task state (Backlog → InProgress → Review → Done).
6. Only Task files move; Story roots (`story.md`) and constitutional/reference docs remain stationary.
7. If any directive conflicts with these rules, pause and escalate.

---
## 6. Core Definitions
- **Spec**: Narrative rationale + scope + acceptance criteria (embodied in `story.md`).
- **Story**: Capability slice containing the governing spec and its task Kanban subfolders.
- **Plan**: Decomposition from acceptance criteria into implementable Tasks.
- **Task**: Atomic unit of work (one markdown file) that progresses across status folders.

---
## 7. Request Handling Flow (Agent Algorithm)
1. Classify intent: feature | bug | refactor | research | chore.
2. Search active Story folders for matching semantics.
3. If Task exists → move to `InProgress/` (if not already) + append progress log.
4. If only Story matches → create a new Task in its `Backlog/`.
5. If no match → initiate Spec Kit (Section 8).
6. If ambiguous candidates → propose list and request confirmation.
7. After completion → enforce lifecycle transitions (Section 9).

---
## 8. Spec Kit Workflow (Creation Path)
1. Create new Story folder: `stories/<next-seq>-<kebab-slug>/` with `story.md` containing:
   - Header: Title, Date, Status: Draft, Owner (if known)
   - Summary / Problem / Rationale
   - Goals & Non-Goals
   - Acceptance Criteria (checkbox list)
   - Risks / Open Questions
   - Relationships (links to existing stories/tasks)
2. Add Plan section or `plan.md` enumerating implementation steps.
3. Generate initial Task files (one per step) in `Backlog/`.
4. Update Story status: Draft → Planned once Tasks exist.

---
## 9. Kanban State Semantics
- `Backlog/`: Ideated; unstarted.
- `InProgress/`: Actively implemented; only one primary assignee context at a time.
- `Review/`: Code / logic complete; awaiting validation or integration.
- `Done/`: Accepted; immutable except for retrospective notes.

Transition invariants:
- Cannot skip states (Backlog → Done prohibited).
- Each move requires a timestamped Progress Log entry.

---
## 10. Task File Canonical Template
```
# Task: <Concise Title>
Status: Backlog | InProgress | Review | Done
Story: <story-number-slug>
Created: <YYYY-MM-DD>
Updated: <YYYY-MM-DD>
Type: feature | bug | refactor | research | chore
Related: [story:<id>], [task:<id>], ...
Owner: <name-or-empty>

## Summary
<short purpose>

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Implementation Notes
- Initial design notes

## Progress Log
- <YYYY-MM-DD HH:MM> Created.
```

---
## 11. Relationship & De-Dup Strategy
Before creating a Task or Story:
1. Search keywords (functional nouns + verbs) across existing Story slugs and Task titles.
2. If overlapping scope: reference and extend instead of duplicating.
3. If incremental capability: new Task under existing Story.
4. Only create a new Story if conceptual boundary is distinct.

Notation guidelines:
- Stories: `[story:03-ai-personalization-based-on-memory]`
- Tasks: `[task:03/memory-index-refactor]`
- Maintain reciprocal `Related:` entries whenever possible.

---
## 12. Working a Task (Agent Behavior)
1. Ensure file resides in `InProgress/` before modifying code tied to it.
2. Append progress entries; never delete historical lines.
3. Keep Implementation Notes additive (delta oriented).
4. On completion: check all acceptance boxes; move to `Review/`.
5. When validated/merged: move to `Done/` + closing log entry.

---
## 13. Review Gate Criteria
A Task may move to `Review/` only when:
- Acceptance Criteria all satisfied
- Relevant code/tests pushed or described
- No unresolved “TBD” markers

Reviewers may add a `## Review` section with feedback. Rejection returns Task to `InProgress/` with rationale logged.

---
## 14. Follow-Ups & Scope Creep
Post-Done discoveries spawn new Tasks (never reopen Done). For clusters of micro follow-ups, create a meta Task referencing them as subtasks.

---
## 15. Future Automation (Not Yet Assumed)
- Linting: Validate Task header schema
- Index generation: Auto-build/update `SPEC-INDEX.md`
- Orphan detection: Tasks without Story linkage
- Cross-reference integrity checker

---
## 16. Escalation Protocol
On conflicting human instruction:
1. Identify violated rule (quote it)
2. Request explicit override
3. Proceed only after confirmation with an override log entry

---
## 17. Quick Agent Checklist
- Map request? (Y/N)
- If N → Spec Kit
- Existing or new Task? (create if missing)
- Status correct? (move if needed)
- Relationships updated?
- Progress logged?

---
## 18. Minimal Operational Examples
- Create incremental feature: Add Task to existing Story Backlog → move to InProgress → implement → Review → Done.
- New capability: Run Spec Kit → Plan → Backlog Tasks.
- Related improvement: Add Task + `Related:` reference to originating Task.

---
## 19. Scope Boundaries (Out of Band)
Do not:
- Modify unrelated Stories while working a single Task.
- Invent architecture beyond listed conceptual services without Spec.
- Remove historical log entries.

---
## 20. Summary Mantra
Map → Extend or Spec → Plan → Task → Flow States → Log → Link.

Adherence ensures auditability, incremental evolution, and coherent collaboration between humans and agents.

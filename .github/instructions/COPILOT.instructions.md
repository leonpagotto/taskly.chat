# 🤖 Copilot Instructions (Unified)

_Last updated: 2025-09-20_

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
## 4. Repository Knowledge Model (speca-chat authoritative model)
Canonical planning artifacts now live under `speca-chat/` (NOT the legacy `docs/` structure):
```
speca-chat/
  stories/
    story-<NNN>/
      story.yml          # Required minimal metadata (id, slug, title, status, created, summary)
      story.md           # Optional narrative / rationale
      tasks/
        <TASK-ID>.task.yml  # Canonical task metadata (authoritative)
        <TASK-ID>.task.md   # Optional extended design / notes
  board/
    <status>/<TASK-ID>.yml  # Generated references (DO NOT edit manually)
  scripts/                  # Validation, generation, reporting utilities
  artifacts/                # Lint / delta output (JSON/CSV)
```
Key shifts from legacy model:
- Tasks are YAML (`*.task.yml`) not markdown header blocks.
- Board state derives from each task's `status` field; generator produces mirror refs under `board/`.
- Status changes occur by editing `status:` in the task YAML then regenerating board refs (never hand-edit `board/`).
- Optional `.task.md` houses richer narrative; absence is acceptable.
Story folders use zero‑padded numbering: `story-001`, `story-002`, etc. `story.yml` holds structured metadata. Acceptance criteria live at task level, not in `story.yml`.
---
## 5. Golden Governance Rules
- Authoritative planning root: `speca-chat/`.
- Stories: `speca-chat/stories/story-<NNN>/story.yml` (+ optional `story.md`).
- Tasks: `speca-chat/stories/story-<NNN>/tasks/<TASK-ID>.task.yml` (optional `<TASK-ID>.task.md`).
- Board refs: `speca-chat/board/<status>/<TASK-ID>.yml` are generated only (run generator script).
- Task `status` enum drives board location; never edit board refs directly.
- All cross-task or story references live in `related:` arrays (flat) inside task YAML.
- Acceptance criteria mandatory & testable (no generic placeholders).
- On structural/process conflicts, escalate before proceeding.

---
## 6. Core Definitions
- **Story (story.yml)**: Structured capability metadata (id, slug, title, status, summary).
- **Story Narrative (story.md)**: Optional deeper context; not authoritative for schema.
- **Task ( *.task.yml )**: Atomic unit containing id, story reference, status, type, summary, acceptance list, related refs, optional notes.
- **Task Narrative (.task.md)**: Optional extended rationale / design notes.
- **Board Ref**: Generated mirror of a task's id+status+story for status dashboards.

---
## 7. Request Handling Flow (Agent Algorithm)
1. Classify intent: feature | bug | chore | research | spike (reserved) | refactor (map to feature/chore if schema restricts).
2. Semantic search: scan `speca-chat/stories/story-*/tasks/*.task.yml` for matching summaries or acceptance terms; also consider story slugs.
3. If suitable task found & not `done` → update its YAML (notes/acceptance progression) and, if status change warranted, modify `status` then regenerate board.
4. If only a story match → create a new `<PREFIX-NNN>.task.yml` under that story's `tasks/`.
5. If no story match → run Spec Kit (Section 8) to create a new story + initial tasks.
6. Ambiguous results → present ranked candidates (id, summary) and request confirmation.
7. After implementing a task change: run validation + board generation scripts (Section 13) before committing.

---
## 8. Spec Kit Workflow (New Story Path)
1. Allocate next `story-<NNN>` (zero-padded) not already present.
2. Create `story.yml` with: `id`, `slug`, `title`, `status: backlog`, `created`, `summary`.
3. (Optional) Author `story.md` capturing problem, rationale, risks, relationships.
4. Derive initial implementation steps → create one YAML task per step (Section 10) with `status: backlog`.
5. Run: board generation + validation.
6. Promote story `status` to `active` once at least one task moves beyond backlog.

---
## 9. Task Status Semantics
Enumerated task statuses (YAML `status` field): `backlog`, `todo`, `in-progress`, `review`, `done`.
Lifecycle rules:
- Forward-only progression (no direct `backlog` → `done`).
- Status change requires justification added to `notes:` or `.task.md` (include date stamp).
- `done` tasks are immutable except for metadata corrections (never rewrite acceptance history).

---
## 10. Task YAML Canonical Template
```
# <TASK-ID>.task.yml
id: DEV-001
story: story-005
status: backlog            # backlog|todo|in-progress|review|done
type: feature              # feature|bug|chore|research|spike (if supported)
created: 2025-09-20
updated: 2025-09-20        # managed by timestamp script (omit if not set)
owner: team                # optional
related:                   # optional flat list
  - IMP-201
summary: Short imperative summary.
acceptance:
  - User can perform X via Y.
  - System persists Z under condition C.
notes: |
  Design rationale, context, progress journal entries with date prefixes.
```

Optional extended narrative/design: `<TASK-ID>.task.md` (freeform). Prefer logging significant scope clarifications with date stamps there or in `notes:`.

---
## 11. Relationship & De-Dup Strategy
De-dup algorithm:
1. Search existing `summary` + acceptance lines across tasks for overlapping nouns/verbs.
2. If enhancement of existing scope, add new acceptance to THAT task only if still atomic; else create a sibling task referencing original via `related:`.
3. Only create a new story if conceptual surface area (user goal set) is distinct from all existing stories.
4. Maintain reciprocity manually for now (validator warns on missing back-links); do not auto-add without confirmation.
Reference format: plain task IDs (e.g., `DEV-001`); story references not embedded inside `related:`—use only task IDs unless cross-story linking is essential.

---
## 12. Working a Task (Agent Behavior)
1. Open the task's `.task.yml` and update `notes:` with a dated entry describing intent before code changes.
2. Adjust `status:` when moving stages; then run board generation.
3. Evolve acceptance only by appending new items (timestamp rationale in `notes:`) — never delete satisfied lines; mark satisfaction by rewriting acceptance item text ONLY if clarifying (do not append checkboxes; criteria remain declarative statements).
4. If scope grows beyond atomic boundaries, split into a new task and link both via `related:`.
5. Do not manually edit generated board refs.
6. Prefer running timestamp script instead of hand-editing `updated:`.

---
## 13. Validation, Tooling & Review Gates
Scripts (run via `pnpm` or `node`):
- `speca-chat/scripts/generate-board.mjs` → sync `board/` with current task statuses.
- `speca-chat/scripts/validate-structure.mjs` → AJV schema + related existence + acceptance heuristics.
- `speca-chat/scripts/report-status-delta.mjs` → legacy vs current drift (export JSON/CSV with `--out`).
- `speca-chat/scripts/update-task-timestamps.mjs` → manage `updated:` fields.
- `speca-chat/scripts/lint-acceptance.mjs` → detailed acceptance quality report (`artifacts/acceptance-lint-report.json`).

Review readiness criteria (before setting `status: review`):
- Acceptance statements reflect implemented observable outcomes.
- No placeholder / weak verb warnings outstanding (or justified in notes).
- Related references reciprocal where meaningful.
- Validation script completes with zero errors (warnings acceptable if documented).

---
## 14. Follow-Ups & Scope Creep
`done` tasks remain immutable (except metadata fix). New discoveries → new tasks referencing original via `related:`. Aggregate multiple minor improvements into one chore task enumerating them in notes.

---
## 15. Future Automation (Roadmap)
- Acceptance auto-fix suggestions & severity tiers (promote certain heuristics to errors).
- Owner normalization enforcement.
- Ordering weights for board columns.
- Extended schema fields (effort, risk, labels, blockedBy/blocks).
- Reciprocal related auto-suggestion patch generator.

---
## 16. Escalation Protocol
On conflicting human instruction:
1. Quote the specific rule or schema requirement.
2. Request explicit override acknowledgment.
3. Log override rationale in the affected task's `notes:` with date.

---
## 17. Quick Agent Checklist
- Intent classified?
- Story located or new required?
- Task exists or needs creation?
- Acceptance clear & testable?
- Status accurate (`status:` field)?
- Board regenerated?
- Validation run (errors = 0)?
- Notes updated with date?
- Related reciprocity checked?

---
## 18. Minimal Operational Examples
- Incremental feature: Add `<PREFIX-NNN>.task.yml` (status backlog) → implement → set status `in-progress` → generate board → validate → move to `review` then `done`.
- New capability: Spec Kit → create `story.yml` + initial tasks → activate first task.
- Refactor improvement: Create chore task; acceptance focuses on preserved behavior + metrics (e.g., bundle size reduced X%).
- Post-completion follow-up: New task referencing original via `related:` both directions.

---
## 19. Scope Boundaries (Out of Band)
Do NOT:
- Hand-edit files under `speca-chat/board/`.
- Remove historical acceptance lines (replace only to clarify, never erase intent).
- Fabricate owner or priority fields not yet standardized.
- Introduce new schema fields without updating this document & validator.

---
## 20. Summary Mantra
Search → Match or Spec → Create YAML Task → Edit Status → Generate Board → Validate → Commit (with dated notes & links).

Adherence ensures auditability, incremental evolution, and coherent collaboration between humans and agents.

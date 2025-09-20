# Taskly.Chat

Taskly.Chat is an **AI-powered personal assistant** that blends conversation, memory, and automation into a single experience. Unlike traditional productivity tools or project managers, Taskly.Chat is designed to work the way people naturally think and talk — through **conversation**.

It acts as a **companion for life and work**, turning fleeting thoughts, reminders, and goals into structured actions without forcing rigid workflows.

---

## 🌟 Core Identity

* **Vision**: To be the central hub of life where every idea, task, and goal — personal or professional — comes together seamlessly. Taskly.Chat empowers people to live fully, act decisively, and achieve balance, making productivity effortless and meaningful.

* **Mission**: Taskly.Chat helps people capture, structure, and accomplish everything that matters by blending intelligent assistance, persistent memory, and a human-like conversational experience.

---

## 🔑 Key Features

### 1. Conversation-Centric

* Everything starts with natural chat.
* Users don’t need to think in “tasks” or “tickets” — Taskly.Chat captures the intent and organizes it automatically.
* Conversation history is preserved within **projects or threads**, allowing continuity over time.

### 2. Personal Memory

* Taskly.Chat remembers what matters: preferences, routines, priorities, important dates.
* This context carries across all future conversations, ensuring that the assistant feels continuous and personalized.
* Memory can be updated, forgotten, or adjusted by the user at any time.

### 3. Instructions & Guidance

* Users can set **persistent instructions** (like tone of voice, goals, or priorities).
* These instructions guide every future output, ensuring consistency across tasks, reminders, and conversations.
* Instructions can apply globally or per “project space.”

### 4. Smart Automations

* Context-aware reminders, nudges, and insights.
* Ability to track progress, habits, or important events without manual setup.
* Integrations with calendars, email, or third-party apps to surface the right information at the right time.

### 5. Balance Between Life & Work

* Unlike project-only tools, Taskly.Chat is designed to handle **both personal and professional contexts**.
* A single space for work planning, personal reminders, creative brainstorming, and daily check-ins.

### 6. Collaboration (Optional)

* Users can **share projects or threads** with others.
* Shared instructions ensure AI-generated output remains consistent across collaborators.
* Conversations within shared spaces become structured, making teamwork smooth without extra overhead.

---

## 🚀 Differentiators

* **Conversation-first design**: Users chat as they would with a person; the AI does the structuring.
* **Persistent memory**: Unlike chatbots that forget context, Taskly.Chat builds a continuous relationship with the user.
* **Instruction-driven behavior**: AI adapts to the user’s style, not the other way around.
* **Personal + Professional scope**: Supports every aspect of life, not just “work tasks.”
* **Human + AI collaboration**: Makes it possible for teams to align on context and let AI assist them together.
* **Seamless continuity**: Versioning and context management prevent repetition and loss of important details.

---

## 🧭 Example Use Cases

* **Personal Life**:

  * “Remind me to call Mom every Sunday.”
  * “Track my workouts this month.”
  * “Plan a birthday dinner for Anna.”

* **Work & Productivity**:

  * “Draft a user story from today’s meeting notes.”
  * “Summarize this long conversation into next steps.”
  * “Help me prepare talking points for tomorrow’s presentation.”

* **Creative & Strategic Thinking**:

  * “Brainstorm album concepts with darker energy.”
  * “Help me outline a workshop agenda for leadership.”
  * “Turn this idea into a structured plan.”

---

## 🎯 Goal

Taskly.Chat is not just another project manager. It’s a **personal AI assistant** that remembers, adapts, and acts as a **bridge between free-form conversation and structured execution** — making productivity feel natural, human, and effortless.

---

## � Canonical Spec & Task Governance

All story + task source of truth lives under `speca-chat/`.

Essential layout:
* Stories: `speca-chat/stories/<story-id>/story.{yml,md}`
* Tasks: `speca-chat/stories/<story-id>/tasks/<TASK-ID>.task.{yml,md}`
* Generated board refs: `speca-chat/board/<status>/<TASK-ID>.yml` (NEVER edit by hand)
* Scripts: `speca-chat/scripts/*.mjs` (migration, validation, reporting, linting)

Archived legacy markdown lives under `archive/<timestamp>/` for historical reference only.

### Authoring Rules
* Create / update tasks only within the story's `tasks/` directory.
* Edit the task YAML `status`; run board generation script (auto in pre-commit) to sync board refs.
* Provide actionable acceptance criteria (no generic placeholders like "Define criteria").
* `related` must reference valid task IDs; reciprocity is warned (non-blocking).
* `updated` timestamp is auto-added via script; do not hand-edit unless necessary.

### Tooling Scripts (Key)
| Script | Purpose |
| ------ | ------- |
| `generate-board.mjs` | Derive `board/` refs from task YAML statuses. |
| `validate-structure.mjs` | AJV schema + structural validation + acceptance heuristics + related checks. |
| `report-status-delta.mjs` | Compares legacy vs current (status/type) with optional `--out` export (json|csv). |
| `update-task-timestamps.mjs` | Adds or refreshes `updated:` fields (`--mode add-missing|touch-changed|set-all`). |
| `lint-acceptance.mjs` | Heuristic acceptance lint; outputs `artifacts/acceptance-lint-report.json`. |
| `cleanup-placeholder-acceptance.mjs` | Legacy migration cleanup (one-off). |
| `migrate-archived-stories.mjs` / `enrich-migrated-statuses.mjs` | One-time migration & metadata enrichment. |

Artifacts land in `artifacts/` (delta exports, acceptance lint report). These can be surfaced in CI later.

### Pre-Commit Governance
The hook (or manual sequence) runs:
1. `node speca-chat/scripts/generate-board.mjs`
2. `node speca-chat/scripts/validate-structure.mjs`
3. (Optional) `node speca-chat/scripts/report-status-delta.mjs --out artifacts/status-delta.json`

Failure (schema/structure) blocks commit; warnings (acceptance quality, missing reciprocity) do not.

### For AI / Automation
Emit BOTH files per new task:
1. Metadata: `<ID>.task.yml` (fields: `id, story, status, type, summary, acceptance, related?, owner?, created, updated?`)
2. Narrative: `<ID>.task.md` (design notes / rationale; optional)

Run board + validation before proposing commit.

## 🛠 Workflow Enforcement
Pre-commit sequence:
1. Agent guidance check (`scripts/agent-check.mjs`).
2. Board regeneration (`speca-chat/scripts/generate-board.mjs`).
3. Structure validation (`speca-chat/scripts/validate-structure.mjs`).

Rules:
* Every task has at least one acceptance criterion.
* Board refs must match task statuses (auto-enforced).
* Only stories listed in the story index are active.
* No manual edits to `speca-chat/board/`.

---

## 🔧 Monorepo Setup
pnpm workspaces structure:
```
package.json (workspaces root)
pnpm-workspace.yaml
apps/
  chat/          # Next.js app (will host lobe-chat UI integration)
packages/
  core/          # Domain models & shared types
  ai/            # AI orchestration (instructions, parsing, task draft extraction)
  integration/   # Adapter boundaries (system prompt & event hooks)
  data/          # Prisma schema & repositories (conversation persistence)
```

### Install
```bash
pnpm install
```

### Develop
```bash
pnpm dev
```

### Build All
```bash
pnpm build
```

### Type Check
```bash
pnpm typecheck
```

### Test (Data Layer)
```bash
pnpm test
```

## 🤖 Lobe-Chat Integration Plan
Adapter-first incremental adoption:
- Phase 1: Basic Next.js shell (done)
- Phase 2: Mount lobe-chat component (pending)
- Phase 3: Instruction layer injection (global/project/ephemeral)
- Phase 4: Task draft extraction pipeline inline with messages
- Phase 5: Memory relevance adapter (heuristic → vector later)
- Phase 6: Persistence + vector memory expansion

## 🔐 Environment Variables
Copy `.env.example` to `.env.local` (either at repo root or inside `apps/chat/`).

Baseline:
```
DATABASE_URL="file:./dev.db"
MODEL_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-pro
# Optional OpenAI (future expansion)
OPENAI_API_KEY=
MODEL_CHAT=gpt-4o-mini
MODEL_FAST=gpt-4o-mini
```

Notes:
- `MODEL_PROVIDER` selects the backend adapter (currently only `gemini` is implemented; others will fallback to Gemini).
- The server route `/api/chat` also accepts a JSON field `provider` to override per-request.
- Never commit real API keys—keep them only in local `.env.local` or deployment secrets.

## 🧩 Core Domain Guidelines
- `@taskly/core`: side-effect free
- Only adapters talk to external providers
- Enforced import boundaries (ESLint `no-restricted-imports`)

## 🗄 Persistence Layer (@taskly/data)
Story 02 added Prisma schema (Conversation, Message) + repositories.
SQLite for dev; Postgres migration path. Participants & meta stored as JSON strings for portability.

## 🛤️ Upcoming Work
1. Mount lobe-chat (IMP-101)
2. Instruction injection (IMP-102 / IMP-103)
3. Conversation API endpoints (IMP-022)
4. Memory personalization story
5. Calendar integration stories

## 🗂 Archival & Legacy
All previous markdown-only task and story files live in `archive/<timestamp>/`. They are excluded from governance and may be referenced for historical context only.

Taskly.Chat is an **AI-powered personal assistant** that blends conversation, memory, and automation into a single experience. Unlike traditional productivity tools or project managers, Taskly.Chat is designed to work the way people naturally think and talk — through **conversation**.

It acts as a **companion for life and work**, turning fleeting thoughts, reminders, and goals into structured actions without forcing rigid workflows.

---

## 🌟 Core Identity

* **Vision**: To be the central hub of life where every idea, task, and goal — personal or professional — comes together seamlessly. Taskly.Chat empowers people to live fully, act decisively, and achieve balance, making productivity effortless and meaningful.

* **Mission**: Taskly.Chat helps people capture, structure, and accomplish everything that matters by blending intelligent assistance, persistent memory, and a human-like conversational experience.

---

## 🔑 Key Features

### 1. Conversation-Centric

* Everything starts with natural chat.
* Users don’t need to think in “tasks” or “tickets” — Taskly.Chat captures the intent and organizes it automatically.
* Conversation history is preserved within **projects or threads**, allowing continuity over time.

### 2. Personal Memory

* Taskly.Chat remembers what matters: preferences, routines, priorities, important dates.
* This context carries across all future conversations, ensuring that the assistant feels continuous and personalized.
* Memory can be updated, forgotten, or adjusted by the user at any time.

### 3. Instructions & Guidance

* Users can set **persistent instructions** (like tone of voice, goals, or priorities).
* These instructions guide every future output, ensuring consistency across tasks, reminders, and conversations.
* Instructions can apply globally or per “project space.”

### 4. Smart Automations

* Context-aware reminders, nudges, and insights.
* Ability to track progress, habits, or important events without manual setup.
* Integrations with calendars, email, or third-party apps to surface the right information at the right time.

### 5. Balance Between Life & Work

* Unlike project-only tools, Taskly.Chat is designed to handle **both personal and professional contexts**.
* A single space for work planning, personal reminders, creative brainstorming, and daily check-ins.

### 6. Collaboration (Optional)

* Users can **share projects or threads** with others.
* Shared instructions ensure AI-generated output remains consistent across collaborators.
* Conversations within shared spaces become structured, making teamwork smooth without extra overhead.

---

## 🚀 Differentiators

* **Conversation-first design**: Users chat as they would with a person; the AI does the structuring.
* **Persistent memory**: Unlike chatbots that forget context, Taskly.Chat builds a continuous relationship with the user.
* **Instruction-driven behavior**: AI adapts to the user’s style, not the other way around.
* **Personal + Professional scope**: Supports every aspect of life, not just “work tasks.”
* **Human + AI collaboration**: Makes it possible for teams to align on context and let AI assist them together.
* **Seamless continuity**: Versioning and context management prevent repetition and loss of important details.

---

## 🧭 Example Use Cases

* **Personal Life**:

  * “Remind me to call Mom every Sunday.”
  * “Track my workouts this month.”
  * “Plan a birthday dinner for Anna.”

* **Work & Productivity**:

  * “Draft a user story from today’s meeting notes.”
  * “Summarize this long conversation into next steps.”
  * “Help me prepare talking points for tomorrow’s presentation.”

* **Creative & Strategic Thinking**:

  * “Brainstorm album concepts with darker energy.”
  * “Help me outline a workshop agenda for leadership.”
  * “Turn this idea into a structured plan.”

---

## 🎯 Goal

Taskly.Chat is not just another project manager. It’s a **personal AI assistant** that remembers, adapts, and acts as a **bridge between free-form conversation and structured execution** — making productivity feel natural, human, and effortless.

---


<!-- Removed duplicated legacy workflow block -->

---

## 🔧 Monorepo Setup (Early Phase)

The codebase is transitioning to a pnpm workspace monorepo:

Structure (current):
```
package.json (workspaces root)
pnpm-workspace.yaml
apps/
  chat/          # Next.js app (will host lobe-chat UI integration)
packages/
  core/          # Domain models & shared types
```

### Install
```bash
pnpm install
```

### Develop
```bash
pnpm dev
```
This runs dev scripts across workspaces (currently just the chat app watcher and any package builds that define `dev`).

### Build All
```bash
pnpm build
```

### Type Check
```bash
pnpm typecheck
```

## 🤖 Lobe-Chat Integration Plan
We will progressively embed lobe-chat functionality instead of forking its repo:
- Phase 1: Basic Next.js app placeholder (done).
- Phase 2: Add lobe-chat dependency and mount core chat component.
- Phase 3: Inject custom instruction layers (global, project, ephemeral) into system prompt assembly.
- Phase 4: Implement Task Extraction side-process -> produce `TaskDraft` metadata.
- Phase 5: Memory adapter (simple in-memory) feeding personalization context.
- Phase 6: Persistence layer (SQLite or Postgres) & vector memory (future).

<!-- (Removed earlier duplicate Environment Variables block; consolidated above) -->

## 🧩 Core Domain Guidelines
- `@taskly/core` must remain side-effect free and persistence agnostic.
- Avoid coupling UI state directly to raw provider APIs—introduce adapters.

## 🛤️ Upcoming Work
1. Wire lobe-chat base component into `apps/chat`.
2. Provide instruction merging utility in a new `@taskly/ai` package.
3. Add draft task extraction route.
4. Implement lightweight memory store abstraction.

---

## 🧪 Quality & Drift Monitoring
Active governance includes:
* Board regeneration (deterministic, idempotent)
* Schema + structural validation (AJV)
* Acceptance heuristics (verb presence, length) – reported as warnings
* Related ID existence + reciprocity warnings
* Legacy drift report (`report-status-delta.mjs`) – currently 0 differences across migrated tasks
* Timestamp automation (`update-task-timestamps.mjs`) ensuring new/modified tasks carry `updated:`
* Acceptance lint artifact for deeper review (`artifacts/acceptance-lint-report.json`)

Planned future improvements:
* Auto-fix suggestions for weak acceptance lines
* Severity tiers (error vs advisory)
* Owner normalization catalog

## 🗂 Board Interaction Model
Future UI will consume generated board refs + task metadata. Prior direct file-move endpoints are deprecated and will be replaced with structured YAML mutations.

## 🔄 Planned Enhancements
* Ordering manifest or per-task weight field.
* Story lifecycle states (proposed/active/archived).
* Rich acceptance metadata (effort, risk, labels, blockedBy/blocks).
* Auto-fix & rewriting pass for acceptance placeholders.
* CI surfacing of delta + acceptance lint metrics.

## 📐 Ordering Strategy (Draft)
Preferred: dedicated manifest per status (git-friendly) – to prototype.

## 🧩 CI / DX Recommendations
Sample CI steps:
```bash
node speca-chat/scripts/generate-board.mjs
node speca-chat/scripts/validate-structure.mjs
node speca-chat/scripts/report-status-delta.mjs --out artifacts/status-delta.json
node speca-chat/scripts/lint-acceptance.mjs
```
Upload `artifacts/` for PR review (drift + acceptance quality). Consider failing if delta differences > 0 for migrated IDs.

## 🗒 Developer Notes
- When creating tasks programmatically ensure lowercase statuses.
- Do not bypass update API when moving a task; manual file moves skip header rewrite.


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

## 🚀 Workflow

This project uses a **Spec-driven workflow**:

* All work starts from a **Spec → Plan → Tasks**.
* Tasks are stored as files inside project version folders.
* Progress is tracked using a **Kanban board**, which is a visualization of the folder structure under `docs/tasks/` (`Backlog/`, `InProgress/`, `Review/`, `Done/`).

### 🔹 For Humans

* Always work from existing task files.
* Move tasks between status folders as you progress.
* Commit changes regularly so the Kanban board stays in sync.

### 🔹 For AI / Copilot

The Copilot follows strict rules for creating, managing, and implementing tasks.
👉 Canonical instructions: `.github/instructions/COPILOT.instruction.md`
👉 Spec Index: `docs/specs/SPEC-INDEX.md`

## 🛠 Workflow Enforcement
We operate under a Spec > Plan > Task > Implement flow.
- Specs & Stories: `docs/taskly-chat/stories/*/story.md`
- Tasks: `docs/taskly-chat/stories/*/Backlog/*.md` (move across status folders)
- Process Reference: `docs/PROCESS.md`
- Copilot Context: `.github/instructions/COPILOT.instruction.md`

Rule: No implementation PR without referencing at least one task ID.

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
Copy `.env.example` to `.env.local`.
```
OPENAI_API_KEY=sk-...
MODEL_CHAT=gpt-4o-mini
MODEL_FAST=gpt-4o-mini
DATABASE_URL="file:./dev.db"
```

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

### Incremental Task Sync (Automation)
To fetch only changed task files between runs:
```
node scripts/sync-tasks-manifest.mjs
node scripts/generate-changed-tasks.mjs      # writes changed-tasks.json (added/modified)
```
Diff against a historical git ref without updating snapshot:
```
node scripts/generate-changed-tasks.mjs --since HEAD~1
```
Emit a full listing (adds `all` array):
```
node scripts/generate-changed-tasks.mjs --full
```
Use the `hash` field in `tasks.json` to validate integrity and decide which task Markdown files to re-fetch.

---
<<<<<<< HEAD

=======
>>>>>>> 4f06eaf (feat(data): introduce @taskly/data with prisma schema, migration, repositories, and tests (Story 02 DEV-020 DEV-021))
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


## 🚀 Workflow

This project uses a **Spec-driven workflow**:

* All work starts from a **Spec → Plan → Tasks**.
* Tasks are stored as files inside project version folders.
* Progress is tracked using a **Kanban board**, which is a visualization of the folder structure under `docs/tasks/` (`Backlog/`, `InProgress/`, `Review/`, `Done/`).

### 🔹 For Humans

* Always work from existing task files.
* Move tasks between status folders as you progress.
* Commit changes regularly so the Kanban board stays in sync.

### 🔹 For AI / Copilot

The Copilot follows strict rules for creating, managing, and implementing tasks.
👉 Canonical instructions: `.github/instructions/COPILOT.instruction.md`
👉 Spec Index: `docs/specs/SPEC-INDEX.md`
_______

## 🛠 Workflow Enforcement
We operate under a Spec > Plan > Task > Implement flow.
- Specs & Stories: `docs/taskly-chat/stories/*/story.md`
- Tasks: `docs/taskly-chat/stories/*/Backlog/*.md` (move across status folders)
- Process Reference: `docs/PROCESS.md`
- Copilot Context: `.github/instructions/COPILOT.instruction.md`

Rule: No implementation PR without referencing at least one task ID.

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

## 🔐 Environment Variables
Duplicate `.env.example` into `.env.local` (root or inside `apps/chat/`).

Required (initial):
```
OPENAI_API_KEY=sk-...
MODEL_CHAT=gpt-4o-mini
MODEL_FAST=gpt-4o-mini
```

## 🧩 Core Domain Guidelines
- `@taskly/core` must remain side-effect free and persistence agnostic.
- Avoid coupling UI state directly to raw provider APIs—introduce adapters.

## 🛤️ Upcoming Work
1. Wire lobe-chat base component into `apps/chat`.
2. Provide instruction merging utility in a new `@taskly/ai` package.
3. Add draft task extraction route.
4. Implement lightweight memory store abstraction.

---

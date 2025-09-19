````markdown
# Taskly Chat Architecture

## Goals
- Leverage lobe-chat framework for rapid AI chat + agent capabilities.
- Provide domain-specific extensions: Task creation, Memory personalization, Project context, Instructions management.
- Maintain clean separation between core domain models and UI / framework glue.

## Monorepo Layout (Planned)
```
/ (repo root)
  package.json              # Workspaces, scripts
  pnpm-workspace.yaml       # (pnpm) workspace declaration
  turbo.json (optional)     # For build orchestration (future)
  .env.example              # Environment variable template
  apps/
    chat/                   # Next.js + lobe-chat customized frontend
  packages/
    core/                   # Pure TS domain models, types, utilities
    ai/                     # AI orchestration layer (prompt builders, memory adapters)
    server/                 # (Later) Dedicated backend services if we outgrow Next.js API routes
```

Initial implementation will create `packages/core` and `apps/chat` only.

## Technology Choices
- Package Manager: pnpm (fast, workspace friendly)
- Runtime: Node 18+ / Next.js (required by lobe-chat)
- TypeScript strict for maintainability.

## Integration with lobe-chat
We will import and extend lobe-chat components & state where possible rather than forking. Custom modules:
- Memory Adapter: Persist user + project memory (initially in-memory / file; later DB)
- Task Extraction Agent: Observes messages, produces structured `TaskDraft` objects
- Instruction Layers:
  1. Global User Instructions
  2. Project Instructions
  3. Conversation Ephemeral Context
  These layers merge to yield the system prompt segment.

## Domain Models (First Pass)
```ts
// Task
id: string
projectId?: string
title: string
description?: string
status: 'pending' | 'in_progress' | 'completed' | 'blocked'
createdAt: string
updatedAt: string
sourceMessageId?: string // link back to originating chat

// Project
id: string
name: string
description?: string
createdAt: string
updatedAt: string

// MemoryEntry
id: string
type: 'preference' | 'fact' | 'pattern'
content: string
relevance: number // 0-1 subjective relevance weighting
createdAt: string
updatedAt: string

// ChatMessage (augmenting lobe-chat)
id: string
role: 'user' | 'assistant' | 'system'
content: string
createdAt: string
metadata?: {
  tasks?: TaskDraft[]
  projectId?: string
  memoryRefs?: string[]
}

// TaskDraft (intermediate suggestion before user confirms)
title: string
description?: string
confidence: number // 0-1
```

## AI Flow (Task Draft Extraction)
1. User sends message.
2. Hook intercepts and calls Task Extraction prompt (lightweight) in parallel to main assistant response.
3. Draft tasks stored in message metadata.
4. UI surfaces draft tasks in a side panel for user confirmation -> becomes persisted Task.

## Memory Personalization
- Simple embedding / keyword approach deferred. Phase 1: heuristic match by keyword + manual pinning.
- Memory merge strategy: recent pinned > high relevance score > recency.

## Configuration
Environment variables (see .env.example to be added):
- OPENAI_API_KEY (or provider key)
- MODEL_CHAT (default model id)
- MODEL_FAST (for extraction tasks)

## Future Evolution
- Introduce persistence (SQLite via drizzle or prisma) in `packages/server`.
- Add vector store for memory relevance.
- Calendar integration packages.

## Contributing Notes (Preview)
- Keep `packages/core` free of external heavy deps.
- Any side-effectful logic (fetch, adapter IO) lives outside core.

## AI Package (`@taskly/ai`)
Provides: 
- `mergeInstructionLayers(layers)` – deterministic ordering (global, project, ephemeral) and concatenation into a single system prompt.
- `extractTaskDrafts(message)` – heuristic prototype for deriving `TaskDraft` objects from a user message (verb-first heuristic). Will be replaced or augmented by a model call.

Planned additions:
- Memory relevance merging helper
- Provider abstraction (OpenAI / Anthropic / local)
- Structured output schema validation

## Lobe Chat Integration Boundaries
Owned by Framework (Future or Optional Adoption):
- Rich chat session state machine & plugin marketplace
- Model provider registry & pricing metadata
- Advanced multilingual localization & desktop packaging

Owned by Taskly:
- Domain models (`@taskly/core`)
- Instruction layering & merging (`@taskly/ai`)
- Task draft extraction heuristics & later ML models
- Memory relevance & personalization logic
- Conversation persistence & project context binding

Adapter Layer (`@taskly/integration`):
- Bridges instruction layers into system prompt string
- Hooks user message events to produce task drafts
- Provides a swappable surface so future deep Lobe adoption won’t impact domain packages

Adoption Strategy:
1. Maintain lightweight custom shell now.
2. Evaluate partial import of Lobe UI primitives.
3. Replace shell with Lobe root component when extension points stable.

Fork Avoidance: prefer composition & adapter; only vendor minimal components if blockages arise.

## Task Governance & Naming (Summary)
Full specification lives in `docs/TASKS-GUIDELINES.md`. Key enforced rules:
- Global unique task ID (prefix+number) across repository.
- Filename ID must match `# Task:` header line.
- Promotion moves file from story backlog to `/tasks/<status>/` with provenance line.
- Validator enforces schema, uniqueness, referential integrity, WIP limits.

Refer to guidelines doc for folder hierarchy, naming rationale, and future enhancements (slug stability warnings).

---
This document will evolve as implementation proceeds.

## Workspace Module Resolution Strategy
We use a stable approach for inter-package imports and builds:

- Root `tsconfig.base.json` centralizes compiler options and `paths` mapping each `@taskly/*` package to its `src/index.ts` for editor-time resolution.
- Packages extend the base, enable `composite` + declarations, and emit to `dist/`.
- Barrel exports omit explicit `.js` extensions; classic Node resolution (with `moduleResolution: Node`) keeps imports clean while producing ESM via `module: ESNext`.
- The app imports only package specifiers (no deep relative cross-package paths) and consumes prebuilt artifacts (`pnpm run build:packages` precedes `next build`).
- No `transpilePackages` is required; Next sees already-compiled JavaScript.
- Client components explicitly declare `'use client';` where state/hooks are used.

Benefits: predictable build graph, simplified import ergonomics, reduced webpack complexity, and easy future package publication.

Enforcement:
- ESLint `no-restricted-imports` rule forbids deep relative cross-package imports into another package's `src` (see IMP-104). All inter-package usage must go through published barrel exports.

````

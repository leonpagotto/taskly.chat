# Development Process

We follow a strict Spec > Plan > Task > Implement workflow to ensure traceability and architectural coherence.

## 1. Spec
Authoritative problem / feature definition lives in `docs/taskly-chat/stories/<story>/story.md` with context and priority.

## 2. Plan
For a chosen story, outline implementation strategy before coding:
- Identify sub-capabilities
- Determine affected packages / services
- Note data model impacts
Plan can be appended to the story file under a `## Plan` heading or a sibling `plan.md`.

## 3. Tasks
Break the plan into atomic task markdown files placed in the story's `Backlog/` folder using ID conventions already present (e.g., `DEV-001.md`). Each file frontmatter should include:
```
---
id: DEV-XYZ
title: Short actionable summary
status: Backlog
story: <story-folder-name>
owner: <github-handle or TBD>
---
Description / acceptance criteria.
```
Move tasks across status folders (`Backlog/`, `InProgress/`, `Review/`, `Done/`) as work progresses.

## 4. Implement
Code changes must reference at least one task ID in commit messages (e.g., `feat(ai): add instruction merge utility (DEV-004)`).

## 5. Validation
- Ensure updated docs if architecture or process shifts.
- Run typecheck, build, and (when added) tests.

## 6. Enforcement Aids
- PR template checklist (see `.github/pull_request_template.md`).
- Copilot must always re-read `.github/instructions/COPILOT.instruction.md` at the start of a session or before large architectural modifications.

## Principles
- No code without a task; no task without a parent story.
- Keep domain purity in `@taskly/core`.
- Defer premature microservice extraction—monorepo packages first.

---

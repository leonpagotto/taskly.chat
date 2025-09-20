# Development Process

We follow a strict Spec > Plan > Task > Implement workflow to ensure traceability and architectural coherence.

## 1. Spec
Authoritative problem / feature definition lives in `stories/<story>/story.md` with context and priority.

## 2. Plan
For a chosen story, outline implementation strategy before coding:
- Identify sub-capabilities
- Determine affected packages / services
- Note data model impacts
Plan can be appended to the story file under a `## Plan` heading or a sibling `plan.md`.

## 3. Tasks
Create atomic task markdown files initially inside the story's `Backlog/` directory (incubation only) using the existing ID conventions (e.g., `IMP-101-some-slug.md`). Minimal header:
```
Status: Backlog
Story: <story-folder-name>
Type: <feature|chore|...>
```

### Central Pipeline (Authoritative Board)
Once a task is PULLED for scheduling or active work, MOVE it (do not copy) from the story backlog into the root pipeline under `tasks/<status>/` where `<status>` is one of:
`todo`, `in-progress`, `review`, `done`.

Accepted canonical status values (validator enforced):
```
backlog, todo, in-progress, review, done
```
(`Backlog` with capital B is accepted only while the file sits inside a story `Backlog/` folder.)

Rules:
- A task must exist in exactly one location (either story backlog OR root pipeline).
- When moved, update the `Status:` field to match the pipeline folder.
- Commits referencing a task must use the ID present in the single canonical file.
- Story `Backlog/` should remain lean; remove migrated files to avoid duplicate IDs.

Example Migration Flow:
1. Create `stories/00-foo/Backlog/IMP-010-do-a-thing.md` with `Status: Backlog`.
2. Decide to start it → `git mv` to `tasks/todo/IMP-010-do-a-thing.md` and edit header to `Status: todo`.
3. Begin work → move (or edit header & path) to `tasks/in-progress/` and set `Status: in-progress`.
4. After PR merged → move to `tasks/done/` and set `Status: done`.

Legacy per-story status folders (`InProgress/`, `Review/`, `Done/`) are deprecated. Only the root `tasks/` pipeline reflects current status.

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

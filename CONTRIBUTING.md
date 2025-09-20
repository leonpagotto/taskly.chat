# Contributing

## Workflow Summary
All canonical planning artifacts live under `speca-chat/`.

1. Identify or create a story folder: `speca-chat/stories/story-<NNN>/`.
2. Add or edit task metadata in `tasks/<ID>.task.yml` (paired optional `.task.md`).
3. Set/update `status`, `type`, `summary`, `acceptance` (ensure criteria are actionable; avoid placeholders).
4. (Optional) Add `related`, `owner`.
5. Run or rely on pre-commit to execute: board generation + validation.
6. Commit with conventional message referencing task IDs.

Legacy folders under `archive/` are read-only.

## Code Principles
- Keep `@taskly/core` pure (types + pure helpers only).
- Side effects (fetch, DB, API calls) belong in app layer or future `@taskly/server`.
- Prefer small focused PRs tied to a single backlog item.

## Lobe-Chat Customization Strategy
We will avoid forking the upstream project initially. Instead:
- Consume it as a dependency.
- Wrap or extend components to inject:
  - Instruction layers
  - Task extraction triggers
  - Memory personalization context
- Only if upstream extensibility proves insufficient will we consider selective vendoring.

## Commit Conventions
Use conventional commits referencing task IDs when relevant:
`feat(core): add TaskDraft confidence field (DEV-001)`

## Environment
Copy `.env.example` to `.env.local` and set required keys.

## Scripts
- `pnpm dev` – run all dev processes.
- `pnpm build` – build packages/apps.
- `pnpm typecheck` – TypeScript across workspace.
- `node speca-chat/scripts/generate-board.mjs` – regenerate board refs.
- `node speca-chat/scripts/validate-structure.mjs` – schema + structural validation + heuristics.
- `node speca-chat/scripts/report-status-delta.mjs --out artifacts/status-delta.json` – legacy drift report.
- `node speca-chat/scripts/update-task-timestamps.mjs --mode add-missing` – add `updated:` where missing.
- `node speca-chat/scripts/lint-acceptance.mjs` – produce acceptance quality report.

Artifacts stored in `artifacts/` for CI consumption.

## Testing
Data layer already uses Vitest. Extend with additional packages as features land. UI/E2E (Playwright) planned.

## Governance Expectations
Commits must pass validation (schema + board). Warnings (acceptance quality, related reciprocity) do not block but should be addressed iteratively.

## Adding a New Task (Check List)
1. Choose next incremental ID per prefix (e.g., `IMP-027`).
2. Create `<ID>.task.yml` in the correct story folder with mandatory fields.
3. Provide 2–6 acceptance criteria starting with actionable verbs.
4. Run validation or stage & let the hook surface issues.
5. Commit: `feat(spec): introduce X (IMP-027)`.

---

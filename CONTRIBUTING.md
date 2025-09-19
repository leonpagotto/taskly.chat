# Contributing

## Workflow Summary
1. Start from a spec / backlog item inside `docs/taskly-chat/stories/*/Backlog/`.
2. Move the file to an appropriate progress folder (process TBD) when you begin work.
3. Implement changes in code referencing the task ID in commit messages.

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

## Testing (Future)
We will introduce Vitest in packages and Playwright for app-level flows.

---

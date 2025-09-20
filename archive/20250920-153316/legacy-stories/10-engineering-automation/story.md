# Story: Story 10: Engineering Automation Enablement
Slug: 10-engineering-automation
Status: draft
Created: 2025-09-19
Owner: system
Area: automation

## Summary
Introduce foundational automation to enforce governance rules and improve developer + agent ergonomics: automatic spec index generation, task header validation, and pre-commit safeguards to prevent accidental inclusion of build artifacts or malformed task files.

## Problem / Rationale
Manual maintenance of story/task indices and validation consumes attention and risks drift. Without automation:
- Duplicate or orphaned tasks may accumulate
- Missing required task header fields reduce clarity
- Build artifacts risk polluting git history
Automation tightens feedback loops, keeps structure healthy, and enables confident agent operations.

## Goals
- Generate a canonical `SPEC-INDEX.md` summarizing all stories and their task counts per status.
- Validate Task markdown files against a required header schema.
- Block commits that include disallowed paths (e.g. `.next/`).

## Non-Goals
- Full semantic validation of acceptance criteria content
- Deep linting of story narrative quality
- CI pipeline configuration (future)

## Acceptance Criteria
- [ ] `docs/taskly-chat/SPEC-INDEX.md` can be regenerated via `pnpm spec:index`
- [ ] Index lists each story: number, slug, title, status, counts (Backlog/InProgress/Review/Done)
- [ ] Task validator reports missing required header fields and invalid status values
- [ ] Pre-commit hook prevents committing `.next/` content or tasks with validation errors
- [ ] Documentation for usage added to `README.md` or CONTRIBUTING

## Risks / Open Questions
- Large repository performance: OK for now (linear scan acceptable)
- Future YAML frontmatter parsing vs simple key:value: current tasks use simple headings

## Relationships
Related: [story:01-natural-language-task-creation]

## Plan
1. Define required task header fields & status whitelist.
2. Implement `scripts/generate-spec-index.mjs` to build index.
3. Implement `scripts/validate-tasks.mjs` returning non-zero on validation failures.
4. Add npm scripts: `spec:index`, `tasks:validate`.
5. Add Husky: `prepare` script + pre-commit hook executing validator & forbid `.next/` staged files.
6. Document usage in CONTRIBUTING.
7. Create Tasks TOOL-001..003.

## Tasks
Planned in Backlog folder as TOOL-001 / 002 / 003.

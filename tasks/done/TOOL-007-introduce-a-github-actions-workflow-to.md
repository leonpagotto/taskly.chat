# Task: TOOL-007
Status: done
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Introduce a GitHub Actions workflow to run task validation and ensure spec index remains up to date on pushes and PRs.

## Acceptance Criteria
- [x] Workflow triggers on push & pull_request
- [x] Runs `pnpm install`, `pnpm tasks:validate`
- [x] Runs `pnpm spec:index` and fails if working tree dirty afterward
- [x] Uses node 20.x

## Implementation Notes
- Simple single-job YAML in `.github/workflows/quality.yml`
- Use `git diff --exit-code` post index generation

## Progress Log
- 2025-09-19 00:00 Created.
- 2025-09-19 19:20 Implemented `.github/workflows/quality.yml` including spec index regeneration, validation, relationship check, typecheck, tests, and diff guard.


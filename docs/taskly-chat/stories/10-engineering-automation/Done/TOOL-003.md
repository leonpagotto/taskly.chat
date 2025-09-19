# Task: Add Pre-Commit Hook for Validation
Status: Done
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Introduce a Husky-powered pre-commit hook to run task validator and block commits that include `.next/` artifacts.

## Acceptance Criteria
- [ ] Husky installed with `prepare` script
- [ ] Pre-commit runs `pnpm tasks:validate`
- [ ] Commit blocked if validator fails
- [ ] Commit blocked if staged paths match `apps/*/.next/`
- [ ] Document workflow in CONTRIBUTING

## Implementation Notes
- Use simple bash script inside `.husky/pre-commit`
- Use `git diff --cached --name-only` to scan staged files
- Provide helpful error messages for failures

## Progress Log
- 2025-09-19 00:00 Created.

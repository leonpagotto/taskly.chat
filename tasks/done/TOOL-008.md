# Task: Enforce Task Type Enumeration
Status: done
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Extend validator to enforce allowed Task Type values: feature | bug | refactor | research | chore | spike | ops | doc.

## Acceptance Criteria
- [ ] Validator fails on unsupported type
- [ ] Error message lists allowed types
- [ ] Existing tasks updated to conform (default unknown replaced with chore or doc as appropriate)

## Implementation Notes
- Modify `validate-tasks.mjs`
- Add migration logic (optional separate script) to map `unknown` -> `chore`

## Progress Log
- 2025-09-19 00:00 Created.

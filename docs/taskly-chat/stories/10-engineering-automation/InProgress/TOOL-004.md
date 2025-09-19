# Task: Normalize Legacy Task Files
Status: Backlog
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: chore
Related: [story:10-engineering-automation]
Owner: system

## Summary
Add canonical headers to all existing legacy task markdown files so that automated validation passes and governance rules apply uniformly.

## Acceptance Criteria
- [ ] All task files in status folders begin with `# Task:` line
- [ ] Required header fields present (Status, Story, Created, Type)
- [ ] Original content preserved under `## Legacy Body` if body existed without template
- [ ] Validator passes with zero errors post-migration

## Implementation Notes
- Infer Status from parent folder name
- Infer Story from story directory name (strip numeric prefix for slug but keep full `<number>-<slug>` in Story field?) → Use `<number>-<slug>`
- Created date use today if absent
- Type fallback: `unknown`

## Progress Log
- 2025-09-19 00:00 Created.

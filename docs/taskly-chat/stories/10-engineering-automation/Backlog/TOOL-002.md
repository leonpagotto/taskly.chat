# Task: Implement Task Header Validator
Status: Backlog
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Add a validation script that checks all task markdown files for required header fields and valid status values.

## Acceptance Criteria
- [ ] Exits with non-zero if any task invalid
- [ ] Reports file path + missing/invalid fields
- [ ] Required fields: Task Title (line 1), Status, Story, Created, Type
- [ ] Status must be one of Backlog|InProgress|Review|Done
- [ ] Supports optional fields (Updated, Related, Owner) without failing
- [ ] Wire to `pnpm tasks:validate`

## Implementation Notes
- Pattern match lines starting with `Status:` etc.
- Ignore `story.md` files (only validate tasks in status folders)
- Provide summary count of valid/invalid tasks

## Progress Log
- 2025-09-19 00:00 Created.

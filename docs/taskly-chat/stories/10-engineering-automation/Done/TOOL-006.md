# Task: Add Relationship Integrity Checker
Status: Done
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Create a script to validate that all story and task references resolve to existing files and optionally report missing reciprocal links. (Removed raw token example to avoid false unresolved reference.)

## Acceptance Criteria
- [ ] Reports unresolved story references
- [ ] Reports unresolved task references
- [ ] Warns (not fails) on missing reciprocal links
- [ ] Exit code non-zero only on unresolved references

## Implementation Notes
- Parse markdown lines containing `[story:` or `[task:` tokens
- Map story id => folder, task id => path pattern `<story-number>/<status>/<task-file>`

## Progress Log
- 2025-09-19 00:00 Created.
- 2025-09-19 01:00 Status -> InProgress; removed placeholder tokens.

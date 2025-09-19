# Task: Enhance Spec Index Output
Status: Done
Story: 10-engineering-automation
Created: 2025-09-19
Updated: 2025-09-19
Type: feature
Related: [story:10-engineering-automation]
Owner: system

## Summary
Add percent completion, last updated timestamp, and optional JSON output mode to spec index generator.

## Acceptance Criteria
- [x] Adds columns: %Done, LastUpdated
- [x] %Done = DoneTasks / TotalTasks (rounded 0 decimals, show `--` if 0 total)
- [x] LastUpdated = latest mtime among story tasks (ISO date)
- [x] JSON mode via `--json` flag outputs structured array

## Implementation Notes
- Compute latest mtime using fs.stat on each task
- Detect flag in process.argv

## Progress Log
- 2025-09-19 00:00 Created.
- 2025-09-19 19:07 Added task collection, percent done, last updated, JSON flag to generator and regenerated index.

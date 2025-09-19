# Task Pipeline Architecture

This repository uses a bifurcated task storage model that separates exploratory / unprioritized ideation (story-scoped backlog) from the execution Kanban pipeline (global).

## Overview

| Layer | Location | Purpose | Allowed Status Values | Folder Names |
|-------|----------|---------|-----------------------|--------------|
| Story Backlog | `stories/<story>/Backlog/` | Capture raw, unprioritized tasks tightly coupled to a specific story domain. | `backlog` (in file metadata) or legacy `Backlog` | `Backlog/` |
| Global Pipeline | `tasks/{todo,in-progress,review,done}/` | Centralized, prioritized flow of active work across all stories. | `todo`, `in-progress`, `review`, `done` | `tasks/` subfolders |

A task exists in exactly one layer at a time:
- While ideating → it lives in the story backlog folder.
- Once prioritized → it is promoted into the global pipeline and leaves the story folder structure.

## File Metadata Conventions

Task markdown files include a header with normalized keys:
```
# Task: <Title>
Status: <backlog|todo|in-progress|review|done>
Story: <story-folder-name>  # when originating from a story backlog
Created: YYYY-MM-DD
Updated: YYYY-MM-DD
Type: <feature|chore|bug|research|...>
Related: [story:<story-folder-name>, ...]
Owner: <user|system>
```
Legacy tasks may still show `Status: Backlog|InProgress|Review|Done` prior to migration; the migration script normalizes these.

## Promotion Workflow

Use the promotion script to move a backlog task into the global pipeline:
```
pnpm task:promote <path-to-backlog-task.md> [--status todo]
```
Actions performed:
1. Validates the source file lives under a story `Backlog/` folder.
2. Updates the `Status:` line (default `todo` unless overridden) to a lowercase pipeline value.
3. Appends a provenance log line at end of file noting promotion timestamp and original path.
4. Moves the file to `tasks/<status>/`.

After promotion, the task is excluded from the story backlog counts and appears in the global pipeline section of the spec index.

## Migration From Legacy Structure

Originally, each story contained `Backlog/ InProgress/ Review/ Done/` subfolders.
We now retain only `Backlog/`, relocating any `InProgress/ Review/ Done/` tasks into the global pipeline.

Run a dry-run migration first:
```
node scripts/migrate-task-structure.mjs --dry
```
Then execute for real:
```
node scripts/migrate-task-structure.mjs
```
Effects per moved file:
- TitleCase status mapped to lowercase (`InProgress` → `in-progress`).
- File moved to `tasks/<mapped-status>/`.
- `Story:` field preserved.
- `Updated:` timestamp refreshed.

## Spec Index Adaptation

`pnpm spec:index` now generates `docs/taskly-chat/SPEC-INDEX.md` with two sections:
- Stories (Backlog Only): counts of backlog tasks per story.
- Global Task Pipeline: aggregate counts of `todo / in-progress / review / done` and % completion.

JSON output (`node scripts/generate-spec-index.mjs --json`) returns:
```
{
  "generated": "<ISO timestamp>",
  "stories": [ { "id": "00-...", "title": "...", "status": "Draft", "backlog": 5 }, ... ],
  "pipeline": { "todo": 3, "in-progress": 2, "review": 1, "done": 7, "total": 13, "pctDone": 54, "lastUpdated": "<ISO>" }
}
```

## Validation

`pnpm tasks:validate` (script: `scripts/validate-tasks.mjs`) now:
- Scans story backlog folders for `*.md`.
- Scans global `tasks/` pipeline folders.
- Enforces lowercase status vocabulary for pipeline tasks.
- Allows legacy uppercase statuses only during migration window (should be eliminated afterward).

## Governance Principles

- Separation enhances clarity between ideation (divergent) and execution (convergent) phases.
- Global prioritization avoids hidden work trapped within story subtrees.
- Backlog tasks remain colocated with their narrative context until pulled.
- Metrics simplified: backlog supply vs active flow.

## Future Enhancements (Potential)
- Story-level WIP filters (list pipeline tasks by originating story).
- Automatic archival of `done` tasks back under their story for historical provenance.
- Latency tracking (time-in-status) via appended provenance entries.

## Commands Summary
| Action | Command |
|--------|---------|
| Generate Spec Index | `pnpm spec:index` |
| Validate Tasks | `pnpm tasks:validate` |
| Promote Backlog Task | `pnpm task:promote <file> [--status todo]` |
| Dry-run Migration | `node scripts/migrate-task-structure.mjs --dry` |
| Execute Migration | `node scripts/migrate-task-structure.mjs` |

---
Document updated: 2025-09-19

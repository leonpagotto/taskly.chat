# Story: Import, Render, and Synchronize Tasks and Stories
Slug: 15-import-render-sync-tasks-stories
Status: active
Created: 2025-09-20
Owner: 
Area: tasks-board

## Summary
Enable users to import an existing SpecKit / Taskly-governed repository (or local folder) containing story and task markdown files, visualize them on a Kanban board, perform board operations (move / reorder / create / delete), and synchronize deltas bi-directionally back to the source filesystem or Git repository.

## Motivation
Teams already managing planning artifacts as versioned markdown want a first-class visual board without abandoning Git-based governance. A reliable import + sync loop bridges textual governance with interactive manipulation.

## Desired Outcomes
- Fast initial index of stories & tasks from folder or repo.
- Real-time reflection of structural file changes (polling or watcher abstraction).
- Explicit user-controlled synchronization (push / pull / two-way) with diff preview.
- Zero drift between board state and file system after sync.

## Scope
In Scope:
- Import via local folder picker or GitHub HTTPS URL (public repos initially).
- Parsing of story + task headers per `STORY_TASK_STRUCTURE.md`.
- Kanban rendering with columns derived from status directories.
- Task move / reorder events captured in memory and serialized into planned file mutations.
- Sync engine applying moves (renames), creations, deletions, and content edits (status line updates) atomically.

Out of Scope (Initial):
- Private repo OAuth flows.
- Merge conflict auto-resolution (expose manual guidance instead).
- Rewriting historic Progress Log entries.
- Archival / analytics views beyond board.

## Success Metrics
- P90 import time for 300 tasks < 3s local, < 6s remote.
- Sync push latency (50 changed tasks) < 4s.
- Zero integrity mismatches (hash comparison) post-sync in automated test runs.
- < 1% failed sync operations over 1000 simulated runs (conflict scenarios excluded).

## Backlog Guidelines
Break work into: ingestion, modeling, board UI, interaction semantics, sync pipeline, conflict handling, preview/diff UI, performance enhancements.

## Example Mapping
Repository snippet:
```
tasks/
  in-progress/IMP-101-minimal-lobe-mount.md
  todo/IMP-102-instruction-layer-adapter.md
stories/
  15-import-render-sync-tasks-stories/
    story.md
```
Board columns:
- In Progress: [IMP-101]
- Todo: [IMP-102]
Story association is displayed on task cards via `Story:` header.

## Risks
- Race conditions during concurrent external edits.
- Large repo performance degradation without batching.
- Cross-platform path normalization issues.

## Mitigations
- Hash-based diff to narrow changed set.
- Dry-run preview showing planned file ops.
- Transaction-like apply with rollback on partial failure.

## Acceptance Criteria (Story Level)
(See individual task backlog for granular AC.)
1. User can import repo/folder; board displays tasks grouped by status.
2. Moving a task between columns marks it dirty (pending sync) without immediate filesystem mutation.
3. Sync Push applies directory move + header status update.
4. Sync Pull detects external file moves and updates board.
5. Diff preview enumerates: moves, creates, deletes, content edits.
6. Conflict scenario (remote change to same task) flagged requiring user choice.
7. Example folder + mapping doc accessible in UI help panel.

## Links / References
- `docs/STORY_TASK_STRUCTURE.md`
- Existing validation & manifest scripts (for re-use in ingestion step).

## Progress Log
- 2025-09-20 Story created with initial scope & metrics

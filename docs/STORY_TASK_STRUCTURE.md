# Story & Task File Structure

This document defines the canonical layout, naming rules, and lifecycle for stories and tasks so external tools (e.g. kanban importers, AI agents) can operate with zero ambiguity.

## Goals
- Single authoritative source for every active/groomed task.
- Clean separation of strategic narrative (story) from executable units (tasks).
- Fast, line-oriented parsing (no YAML dependency) for automation.
- Enforced WIP limits and anti-duplication guarantees.

## Directory Layout
```
stories/
  <story-slug>/
    story.md              # Story definition
    Backlog/              # Optional pre-pipeline draft tasks
      <TASK_ID>-<kebab>.md
      _draft-*.md         # (Optional) un-ID'd ideas

tasks/
  backlog/                # Groomed but not yet scheduled
  todo/                   # Ready to pick up
  in-progress/            # Actively being implemented (WIP limit enforced)
  review/                 # Awaiting review / validation
  done/                   # Completed & immutable (except cross-links)
```

## Story Files
Path: `stories/<story-slug>/story.md`

Header (first lines, fixed order):
```
# Story: <Human Title or ID>
Slug: <story-slug>
Status: <active|paused|deprecated>
Created: YYYY-MM-DD
Owner: <optional>
Area: <domain or epic>
```

Recommended sections:
1. Summary
2. Motivation
3. Desired Outcomes
4. Scope
5. Out of Scope
6. Success Metrics
7. Backlog Guidelines (optional)
8. Links / References

Rationale: Stories hold durable context; tasks remain concise. Keeping a stable header permits fast scanning without parsing all markdown content.

## Draft / Story-Local Backlog
Path: `stories/<story-slug>/Backlog/`
- Contains early candidate tasks still tied tightly to story ideation.
- File name pattern before promotion: `_draft-short.md` or provisional `<TASK_ID>-<kebab>.md` if an ID is preallocated.
- On promotion: MOVE (never copy) to `tasks/<target-status>/` (usually `todo/`), update header & progress log, delete the original file.

## Task Files (Pipeline)
Path: `tasks/<status>/<TASK_ID>-<kebab-title>.md`

Header (first lines, fixed order):
```
# Task: <TASK_ID>
Status: <backlog|todo|in-progress|review|done>
Story: <story-slug|NONE>
Created: YYYY-MM-DD
Type: <feature|chore|bug|research|spike>
Related: <space-separated refs>   # optional (task:ABC-123 story:slug PR:#123)
Owner: <optional>
```

Standard sections (in order, omit only if empty):
1. Summary
2. Acceptance Criteria
3. Implementation Notes
4. Progress Log
5. Migration / Legacy Note (optional)
6. Future Enhancements (optional)
7. Deprecation Note (optional)

### Progress Log Format
Plain bullet list with ISO date first:
```
## Progress Log
- 2025-09-20 Promoted to in-progress; initial implementation
- 2025-09-21 Added edge-case tests
```

### Naming Conventions
- Task ID: `<PREFIX>-<NNN>` (e.g. `IMP-101`, `DEV-002`, `RES-001`). Prefix taxonomy:
  - `IMP`: Implementation integration increments
  - `DEV`: App / feature dev
  - `RES`: Research / spike
  - Extendable: `BUG`, `OPS`, etc.
- File name: `<TASK_ID>-<kebab-title>.md`
- Kebab title: lowercase, alphanumeric + dashes, concise (avoid fillers: the, a, to, of).

### Status = Directory Truth
Directory placement IS the canonical state. The `Status:` line must match. Moves are atomic state transitions (auditable by git history) and enable:
- O(1) WIP counting (list files in `in-progress/`).
- Elimination of stale duplicates (no “same task in two places”).

## Lifecycle Flow
1. Ideation: Story Backlog draft (`stories/<slug>/Backlog/`).
2. Groomed: Move to `tasks/backlog/` (optional, can skip if ready).
3. Ready: Move to `tasks/todo/`.
4. Active: Move to `tasks/in-progress/` (respect WIP limit).
5. Review: `tasks/review/`.
6. Done: `tasks/done/` (immutable except cross-link notes).

Each move appends a dated Progress Log entry.

## Validation Rules
Automation should enforce:
- Filename ID == `# Task:` header ID.
- Directory name == `Status:`.
- Unique Task IDs across repo.
- `Created:` not in the future.
- WIP limit (e.g. max N files under `in-progress/`).
- No duplicate file paths for same ID.
- Story reference must match an existing story slug unless `Story: NONE`.

Optional advanced rules:
- Freshness: `in-progress` tasks require a log entry within last X days.
- `done/` tasks forbid edits outside Deprecation or cross-link sections.

## Parsing Strategy (Tooling)
Read only the first ~12 lines to capture headers (stop at first blank line or section heading starting with `##`). Regex samples:
```
^# Task: (.+)$
^Status: (.+)$
^Story: (.+)$
^Created: (\d{4}-\d{2}-\d{2})$
```
Stories follow similar patterns with `# Story:` and `Slug:`.

## Why Plain Headers (Not YAML)
- Simpler merging (no indentation sensitivity).
- Easy grep/awk scripting.
- Reduces accidental schema drift by casual editors.

## Anti-Duplication Guarantees
- Draft stays only in story backlog until promoted.
- Promotion = MOVE (git tracks rename) never copy.
- Spec index script scans only `tasks/*/*` for active pipeline data.

## Index Generation
The spec index aggregator should output:
- Task counts by status.
- Story → task mapping grouped by status.
- Orphans (tasks with unknown `Story:`) for remediation.
- WIP usage vs limit.

## Extensibility (Forward-Compatible Fields)
Future header keys (safe to add after `Owner:`):
```
Priority: <low|normal|high>
Tags: discovery parsing
Risk: integration-coupling
Estimate: 3d
```
Parsers must ignore unknown lines gracefully.

## Backlog Hygiene
- Periodically prune or promote story backlog entries older than threshold.
- Keep global `tasks/backlog/` lean: aim to convert to `todo/` or drop by next grooming cycle.

## Examples
Story: `stories/00-lobe-chat-framework-integration/story.md`
Task: `tasks/in-progress/IMP-102-instruction-layer-adapter.md`

## Migration / Legacy Notes
If migrating from legacy nested paths, add a `## Migration Note` section listing the old path, then remove the legacy file.

## Quick Checklist (Creating a New Task)
1. Choose ID & kebab title.
2. Create file under `tasks/backlog/` (or `todo/` if immediately actionable).
3. Fill header lines in prescribed order.
4. Write Summary + Acceptance Criteria.
5. Commit (CI validator will enforce structure).
6. Move through pipeline with progress log updates.

## Quick Checklist (Promoting Story Backlog Draft)
1. Assign TASK_ID if absent.
2. Move file to `tasks/todo/`.
3. Update header (`Status:` + `Story:` ensure correct slug).
4. Add progress log entry noting promotion.
5. Delete original draft file.

---
This structure ensures clarity for humans, zero friction for scripts, and safe scaling of the planning & execution pipeline.

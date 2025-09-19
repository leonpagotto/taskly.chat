# Task Governance & Naming Guidelines

This document defines the canonical folder structure, task file naming convention, and uniqueness rules enforced by automation.

## 1. Canonical Folder Structure

```
docs/taskly-chat/stories/<story-slug>/
  story.md
  Backlog/              # Story-scoped backlog tasks only (Status: Backlog)
  Archive/ (optional)   # Archived completed tasks for historical reference
tasks/
  todo/
  in-progress/
  review/
  done/
tasks.yaml              # Generated manifest of all pipeline tasks
tasks.json              # JSON variant (generated)
tasks-board.json        # Aggregated board + metrics data (generated)
metrics/tasks-metrics.json  # Time-in-status metrics (generated)
tasks.config.json       # WIP limits & archival retention
```

Rules:
- Story backlog tasks remain inside their story `Backlog/` directory until promoted.
- Promotion moves a task file into `/tasks/<status>/` (status: todo|in-progress|review|done).
- When archived, tasks may move back under the original story `Archive/` directory (path recorded in provenance).

## 2. Task File Naming Convention

Pattern:
```
<ID>-<kebab-short-title>.md
```

Where:
- `<ID>` is an uppercase alphanumeric identifier (e.g. `IMP-101`, `ANL-100`, `DOC-001`).
- Prefix segments (e.g. `IMP`, `DOC`, `ANL`, `PERF`, `ARCH`, `QA`, `OBS`, `MEM`) convey task type or domain.
- Numeric portion is zero-padded to at least 3 digits within its prefix series.
- `<kebab-short-title>`: Lowercase; 3–6 concise words; letters, digits, and dashes only.

Examples:
- `IMP-101-minimal-mount.md`
- `ANL-100-feasibility-licensing.md`
- `QA-107-adapter-test-harness.md`

## 3. Uniqueness Rules (ENFORCED)

Automation enforces the following uniqueness invariants:
1. Global ID Uniqueness: The `<ID>` portion (e.g. `IMP-101`) must be unique across the entire repository (story backlogs + pipeline + archive). No two task files may reuse the same `<ID>` irrespective of location.
2. Filename ↔ Internal ID Consistency: Inside each task markdown, the `# Task: <ID>` header line must match the `<ID>` used in the filename prefix exactly.
3. Slug Stability: The `<kebab-short-title>` portion may evolve for clarity, but changes should be rare. Validator will warn (not fail) if the slug changes for an already promoted task (future enhancement placeholder).
4. Single Source of Truth: The `<ID>` should not appear in multiple different status directories simultaneously. (Validator checks for multi-location duplication.)

Violation Handling:
- Hard Fail: Duplicate `<ID>` detected; mismatch between file header and filename; multiple copies of same `<ID>` in pipeline.
- Warning (future): Slug changed post-promotion.

## 4. Creation Workflow

Preferred new backlog task creation uses:
```
node scripts/create-task.mjs --story <story-slug> --prefix <PREFIX>
```
This allocates the next sequential numeric portion for the given prefix (scans backlog + pipeline) and scaffolds a compliant file.

## 5. Promotion & Status Changes

- Promotion script moves file from story backlog to `/tasks/todo/` and appends a provenance event.
- Status transitions move the file between pipeline subdirectories appending standardized provenance lines:
```
- 2025-09-19T12:34:56Z EVENT:status-change from=backlog to=todo
```

## 6. Validation Summary

`node scripts/validate-tasks.mjs` checks:
- Schema & required metadata fields.
- Duplicate IDs / multi-location presence.
- Referential integrity for `Related:`, `blocking:`, `blocked-by:`.
- WIP limits (from `tasks.config.json`).
- Filename ↔ ID consistency (new rule).

## 7. Future Enhancements (Planned)
- Enforce slug normalization rule (kebab-case) as error (currently assumed correct via creation/normalization scripts).
- Track slug change history in provenance for analytics.
- Optional lint rule to forbid direct editing of IDs.

## 8. Rationale
Global uniqueness simplifies manifest generation, cross-story referencing, provenance tracking, analytics, and prevents ambiguity in automation (promotion, archival, metrics). Prefix segmentation keeps readability & categorization without introducing hierarchical collisions.

---
Document version: 2025-09-19
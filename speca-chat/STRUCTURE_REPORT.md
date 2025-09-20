# Task & Story Structure Report

Date: 2025-09-20
Scope: Canonical specification of `speca-chat/` story + task hierarchy, schemas, naming, lifecycle, and automation guidelines for future AI task generation & validation.

## 1. Directory Layout
```
speca-chat/
  stories/
    story-<NNN>/
      story.yml            # Story metadata (schema aligned)
      story.md             # Narrative / context (optional but recommended)
      tasks/
        <TASK-ID>.task.yml # Canonical task metadata
        <TASK-ID>.task.md  # (Optional) Extended narrative, design notes, rationale
  board/
    <status>/
      <TASK-ID>.yml        # Generated board reference (DO NOT hand-edit)
  schemas/ (if added later)
  scripts/                 # Migration, validation, reporting utilities
```

## 2. Story Identifier Conventions
- Folder: `story-<NNN>` where `<NNN>` is zero-padded incremental (e.g. `story-005`).
- `story.yml` minimal required fields:
  - `id`: matches folder (`story-005`)
  - `slug`: human-readable slug derived from original legacy story slug
  - `title`: concise descriptive name
  - `status`: one of: `backlog|active|done` (future expansion permitted)
  - `created`: ISO 8601 date
  - `summary`: short purpose statement
- Avoid embedding acceptance criteria at story-level; belongs at task granularity.

## 3. Task Identifier Conventions
- File pair: `<AAA-NNN>.task.yml` (+ optional `.task.md`).
- Prefix segment (`AAA`) reflects functional area or competency (examples: `DEV`, `IMP`, `DES`, `INT`, `DEF`, `QUA`, `RES`, `BUI`, `CRE`, `CON`, `COM`, `ENS`, `UPD`, `ADA`, `TES`, `WRI`, `DAT`).
- Numeric segment is zero-padded incremental within prefix namespace (not globally unique by number alone). Full ID uniqueness = `AAA-NNN`.
- Extraction from legacy: first two dash‑delimited segments of original filename.

## 4. Task YAML Schema (Authoritative Subset)
```
id: DEV-001
story: story-005
status: backlog        # Normalized enumerated status
created: 2025-09-15     # ISO date
updated: 2025-09-18     # (optional) maintained by automation
priority: medium        # (optional) future reserved
owner: team             # (optional) normalized token or user handle
related:                # (optional) cross-task references (flat array; no nesting)
  - IMP-201
type: feature           # Enum: feature|chore|bug|research|spike (research added)
summary: Short imperative summary.
acceptance:             # Ordered list of verifiable criteria
  - [criteria 1]
  - [criteria 2]
notes: |                # (optional) multi-line freeform notes
  Rationale or design hints.
``` 

### 4.1 Enumerations
- `status` (task-level board alignment): `backlog`, `todo`, `in-progress`, `review`, `done` (current set). Completed tasks mirror legacy if present.
- `type`: `feature`, `chore`, `bug`, `research` (extended), `spike` (reserve). If uncertain default to `chore` or `feature` (avoid empty).

### 4.2 Required Fields
`id`, `story`, `status`, `type`, `summary`, `acceptance` (may start with a single TODO style item but must not be the generic placeholder string after cleanup).

### 4.3 Acceptance Criteria Rules
- Each item must be phrased testably (observable outcome, not implementation detail).
- No blank items or generic placeholders like "Migrated placeholder".
- Prefer consistent verbs: "User can", "System persists", "API returns", etc.

## 5. Generated Board References
- Location: `speca-chat/board/<status>/<TASK-ID>.yml`.
- Content minimal mirror: `id`, `status`, `story`. (Current scripts generate from source tasks.)
- Treated as derivative; re-run `generate-board` script instead of manual edits.
- Validation ensures 1:1 mapping and correct status directory.

## 6. Validation Pipeline
1. Run `validate-structure.mjs`:
   - Parses all `*.task.yml`.
   - Applies AJV schemas (task + story + board ref).
   - Checks uniqueness of task IDs.
   - Cross-verifies board directory alignment.
   - Captures acceptance list presence + non-placeholder.
2. Scripts may auto-strip extraneous `$schema` keys or deprecated fields.
3. Failure conditions abort pre-commit (hook integration planned / present).

## 7. Migration & Enrichment Scripts (Overview)
- `migrate-archived-stories.mjs`: Adds missing stories + tasks from archived legacy material, normalizes IDs & statuses.
- `enrich-migrated-statuses.mjs`: Retrofits lost `status`, `type`, `owner`, `related` metadata using legacy headers.
- `cleanup-placeholder-acceptance.mjs`: Replaces placeholder acceptance arrays with structured TODO entry.
- `report-status-delta.mjs`: Compares legacy vs. current to surface drift (status/type).

## 8. Status Normalization Logic
Legacy statuses mapped to canonical set:
```
legacy -> canonical
"backlog"|"idea" -> backlog
"todo"|"ready" -> todo
"in-progress"|"doing" -> in-progress
"review"|"pr"|"qa" -> review
"done"|"complete"|"closed" -> done
```
Unrecognized legacy statuses default to `backlog` with a warning (future: attach annotation in `notes`).

## 9. Related Tasks
- Stored as a flat string array.
- No recursive or nested arrays (validator previously corrected legacy nesting issues).
- References must be valid existing task IDs (future enhancement: cross-check existence).

## 10. Owner Field
- Optional; use lowercase handle tokens or `team`.
- Omit if unknown rather than inventing placeholder.

## 11. AI Task Generation Guidelines
When generating new tasks:
1. Choose prefix reflecting competency (introduce new prefixes sparingly; document rationale).
2. Determine `type` first; influences acceptance style (e.g., `research` tasks may have exploratory acceptance that defines deliverable artifacts: summary doc, decision matrix, spike prototype).
3. Provide 2–6 acceptance items; prefer fewer high-quality items over exhaustive checklists.
4. Ensure at least one acceptance item is objectively testable (e.g., measurable output, API contract, UI element existence).
5. Avoid embedding implementation steps; those belong in the `.task.md` or subsequent sub-tasks.
6. Maintain atomic scope: each task should be completable within a single flow (e.g., 0.5–2 days engineering effort).

## 12. Extending the Schema (Forward Plan)
Potential fields (not yet implemented):
- `effort` (t-shirt sizing), `risk`, `epic`, `labels` (string array), `blockedBy`, `blocks`.
Additions must update schemas + validator and appear in structure report revisions.

## 13. Quality Gates Summary
- No placeholder acceptance.
- All tasks must validate via AJV.
- Board regenerated with zero orphan or duplicated IDs.
- Delta report should show 0 drift for migrated tasks.

## 14. Automation Hooks
Pre-commit recommended sequence:
1. (Optional) format / lint
2. `node speca-chat/scripts/generate-board.mjs`
3. `node speca-chat/scripts/validate-structure.mjs`
4. (Optional) `node speca-chat/scripts/report-status-delta.mjs` (warning only)

## 15. Known Gaps / TODO
- Cross-check `related` IDs existence.
- Automatic insertion of `updated` timestamp on modifications.
- Acceptance heuristic linting (imperative mood, measurable phrasing).
- Owner normalization catalog.

---
This document is the authoritative reference for future tooling and AI-based generation. Update it atomically with any schema or process change.

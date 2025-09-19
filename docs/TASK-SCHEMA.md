# Task Workflow & Schema

This document defines the authoritative workflow rules, task file schema, and the `tasks.yaml` manifest contract used by the Kanban UI and Copilot automation.

---
## 1. Workflow Rules

### 1.1 Lifecycle States
`backlog → todo → in-progress → review → done`

### 1.2 Location by State
| State | Storage Path | Notes |
|-------|--------------|-------|
| backlog | `docs/taskly-chat/stories/<story>/Backlog/` (or future `tasks/` subfolder) | Story-scoped ideation only. |
| todo | `tasks/todo/` | Centralized pipeline. |
| in-progress | `tasks/in-progress/` | Active execution. |
| review | `tasks/review/` | Awaiting validation / QA. |
| done | `tasks/done/` | Completed work (optionally later archived per story). |

### 1.3 Movement Rules
- A task file exists in exactly one state directory reflecting its `status` field.
- Promotion from backlog moves file to `tasks/<status>/` and updates `status`.
- Status changes always trigger: (a) path move, (b) `status:` update, (c) `updated:` timestamp refresh.
- Optionally, archival can move a finished task from `tasks/done/` to `docs/taskly-chat/stories/<story>/archive/` (not yet automated).

### 1.4 Copilot Responsibilities
| Action | Copilot Capability |
|--------|--------------------|
| Create backlog task | Generate file with valid frontmatter in story backlog. |
| Promote task | Update status to `todo` and move file. |
| Progress task | Move across pipeline columns & sync metadata. |
| Sync manifest | Regenerate `tasks.yaml` after any changes. |
| Validate | Run schema/structure validation script. |

---
## 2. Task File Schema (YAML Frontmatter)
Placed at top of each task file (Markdown or pure YAML). Followed by rich description / notes if Markdown.

```yaml
id: <string|int>                # Unique within repo (recommend zero-padded per story or global numeric)
slug: <kebab-case-short-name>    # Derived from title; used in filename (optional)
title: "Human readable task title"
description: "Short structured summary (body may expand below frontmatter)."
status: backlog                  # One of: backlog | todo | in-progress | review | done
story: <story-folder-name>       # e.g. 10-engineering-automation
assignee: <username|system|null>
spec: <relative-path-to-spec>    # Optional pointer to story spec or design doc
created: YYYY-MM-DD
updated: YYYY-MM-DD
priority: medium                 # low | medium | high | critical
labels: [platform, ux]           # Optional taxonomy list
related: ["story:10-engineering-automation", "task:IMP-004"]
estimate: 3                      # Optional story points / t-shirt translation
risk: low                        # low | medium | high (implementation risk)
blocking: ["task:DEV-002"]      # IDs this task is waiting on
blocked-by: []                   # Alias for clarity (one of blocking / blocked-by may be used)
provenance:                      # Optional structured history (script may append)
  - 2025-09-19T20:10:11Z created
  - 2025-09-19T20:15:02Z promoted backlog→todo
```

### 2.1 Required Fields
`id, title, status, story, created, updated`

### 2.2 Computed / Managed Fields
| Field | Managed By | Rule |
|-------|------------|------|
| status | UI / scripts | Must match directory. |
| updated | scripts | Refresh on any mutation. |
| provenance | scripts | Append immutable events. |

### 2.3 Filename Convention
`<ID>-<slug>.md` (e.g. `001-login-form.md`)
- ID must match `id` field.
- Slug recommended but optional; scripts infer missing slug from title.

---
## 3. Manifest Files: `tasks.yaml` & `tasks.json`
Root-level machine indices consumed by the Kanban UI (YAML for humans) and integrators (JSON for programmatic usage).

```yaml
version: 1
generated: 2025-09-19T20:20:00Z
pipeline:
  todo: 0
  in-progress: 4
  review: 0
  done: 9
stories:
  backlog:
    00-lobe-chat-framework-integration: 5
    01-natural-language-task-creation: 9
    # ... etc
tasks:
  - id: TOOL-001
    title: Implement Spec Index Generator
    status: done
    story: 10-engineering-automation
    file: ./tasks/done/TOOL-001.md
    assignee: system
  # ...
```

### 3.1 Manifest Sections (YAML / JSON share same structure)
| Section | Purpose |
|---------|---------|
| version | Schema versioning for forward compat. |
| generated | ISO timestamp of last sync. |
| pipeline | Aggregated counts by active status. |
| stories.backlog | Per-story backlog counts. |
| tasks | Flat list of all tasks (backlog + pipeline). |

### 3.2 Task Entries in Manifest
Minimal fields necessary for fast board rendering:
`id, title, status, story, file, assignee (optional)`

Additional values (priority, labels) MAY be included but are optional.

---
## 4. Sync Process
1. Developer or Copilot modifies tasks (create / move / edit).
2. Run: `pnpm tasks:manifest` (script) → regenerates `tasks.yaml` & `tasks.json` deterministically.
3. Commit both changed task files + updated manifests.
4. CI enforces cleanliness (fails if regeneration changes uncommitted files).

---
## 5. Script Responsibilities
`scripts/sync-tasks-manifest.mjs`:
- Scans story backlog folders & pipeline directories.
- Parses YAML frontmatter (or header key: value lines) from Markdown.
- Derives missing `id` from filename if absent.
- Emits sorted task list (by status order, then id).
- Writes `tasks.yaml` and `tasks.json` atomically.

Additional Scripts:
- `scripts/promote-task.mjs` (backlog → pipeline + provenance event, refresh Updated)
- `scripts/update-task-status.mjs` (pipeline status transitions + provenance)
- `scripts/archive-done-tasks.mjs` (optional archival for aged done tasks)
- `scripts/migrate-task-structure.mjs` (one-time legacy migration)

---
## 6. Status Ordering
Canonical ordering for display & sorting:
`backlog < todo < in-progress < review < done`

---
## 7. Validation & Governance
- `scripts/validate-tasks.mjs` enforces required fields & duplicate ID detection.
- CI workflow `.github/workflows/tasks-governance.yml` regenerates spec index + manifests and fails if dirty.
- Duplicate IDs across backlog + pipeline are disallowed (prevents simultaneous backlog + active duplication).
- Future: referential integrity of `related`, cycle time metrics from provenance.

---
## 8. Extension Ideas
- Add cycle time metrics using provenance events.
- Auto-generate burndown snapshots.
- Maintain separate `archive/` trees per story for done tasks older than N days.

---
## 9. Command Summary
| Action | Command |
|--------|---------|
| Generate Spec Index | `pnpm spec:index` |
| Validate Tasks | `pnpm tasks:validate` |
| Sync Manifest (yaml+json) | `pnpm tasks:manifest` |
| Promote Backlog Task | `pnpm task:promote <file> <status>` |
| Update Pipeline Status | `pnpm task:status <file> <status>` |
| Archive Old Done Tasks | `pnpm tasks:archive -- --days 30` |
| Migrate Legacy Structure | `node scripts/migrate-task-structure.mjs` |

Document updated: 2025-09-19

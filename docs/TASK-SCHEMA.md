> DEPRECATED DOCUMENT

# Task Workflow & Schema (Legacy)

Superseded by YAML task governance under `speca-chat/`. See:
- `.github/instructions/COPILOT.instructions.md`
- `speca-chat/STRUCTURE_REPORT.md`

---
Legacy lifecycle retained conceptually but implemented via YAML `status:` edits + board regeneration.

### 1.1 Lifecycle States
`backlog → todo → in-progress → review → done`

### 1.2 Location (Legacy)
Legacy per-status directories replaced by YAML status field + generated board refs.

### 1.3 Movement Rules
- A task file exists in exactly one state directory reflecting its `status` field.
- Promotion from backlog moves file to `tasks/<status>/` and updates `status`.
- Status changes always trigger: (a) path move, (b) `status:` update, (c) `updated:` timestamp refresh.
- Optionally, archival can move a finished task from `tasks/done/` to `stories/<story>/archive/` (not yet automated).

### 1.4 Copilot Responsibilities
| Action | Copilot Capability |
|--------|--------------------|
| (Legacy) Create backlog task | (Deprecated) |
| (Legacy) Promote task | (Deprecated) |
| (Legacy) Progress task | (Deprecated) |
| (Legacy) Sync manifest | (Removed) |
| Validate (current) | Run `pnpm spec:validate` |

---
## Current Schema Location
Inline YAML in `<TASK-ID>.task.yml` (no markdown frontmatter). Optional narrative file `<TASK-ID>.task.md` permitted.

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
Legacy manifests removed; derive state from tasks + board refs.

Legacy manifest examples removed.

---
Sync now: `pnpm spec:board && pnpm spec:validate`.

---
Legacy scripts obsolete; see `speca-chat/scripts/` for active tooling.

Additional Scripts:
- `scripts/promote-task.mjs` (backlog → pipeline + provenance event, refresh Updated)
- `scripts/update-task-status.mjs` (pipeline status transitions + provenance)
- `scripts/archive-done-tasks.mjs` (optional archival for aged done tasks)
- `scripts/migrate-task-structure.mjs` (one-time legacy migration)

---
Ordering implied by validator; board refs grouped by status directories.

---
Validation: `validate-structure.mjs` (AJV + related + acceptance heuristics) & `lint-acceptance.mjs` for quality.

---
Extension ideas consolidated in Copilot instructions roadmap.

---
## Command Summary (Current)
| Action | Command |
|--------|---------|
| Generate Board | `pnpm spec:board` |
| Validate Structure | `pnpm spec:validate` |
| Delta Report | `pnpm spec:delta` |
| Lint Acceptance | `pnpm spec:lint-acceptance` |
| Update Timestamps | `pnpm spec:timestamps` |

Last updated (deprecation): 2025-09-20

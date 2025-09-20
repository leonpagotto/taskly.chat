# speca-chat

Structured workspace for specs → plans → stories → tasks → implementation.

## Folders
- `specs/` Authoritative feature specifications (`*.spec.md|yml`).
- `plans/` Implementation & sequencing plans derived from specs.
- `stories/` User stories with narrative + metadata + tasks.
- `board/` Kanban state references (YAML symlinks / mirrors of task status).
- `implementation/` Delivered outputs grouped by feature.
- `agents/` Agent persona configuration.
- `docs/` Project-level guidance.

## Flow
1. Write spec (`specs/feature-x.spec.md`).
2. Derive plan (`plans/feature-x.plan.md`).
3. Story folder (`stories/story-001/`) with `story.md` + `story.yml`.
4. Create tasks under `stories/.../tasks/` with paired `.task.md` + `.task.yml`.
5. Update task YAML `status`; regenerate board refs.
6. Implementation lands under `implementation/feature-x/`.

## Board
Board YAML files are lightweight references containing at least:
```yaml
id: TASK-001
story: story-001
status: in-progress
path: ../../stories/story-001/tasks/task-001.task.yml
```
A generator script can rebuild board directories from task YAML status fields.

## Conventions
- IDs: `story-XXX` and `task-XXX` (zero-padded 3+ digits) or domain prefixes allowed (`IMP-101` still supported if mapped).
- YAML front-matter style not used; separate `.yml` keeps metadata machine-friendly.
- Markdown holds narrative, rationale, and acceptance criteria.

## Scripts (planned)
- `scripts/generate-board.mjs` – rebuild `/board` from story task metadata.
- `scripts/validate-structure.mjs` – enforce schema & cross references.


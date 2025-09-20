> DEPRECATED DOCUMENT

# Story & Task File Structure (Legacy)

The markdown-based story + per-status directory pipeline described here has been superseded by the YAML task model under `speca-chat/`.

Authoritative Replacement:
- Story metadata: `speca-chat/stories/story-<NNN>/story.yml` (+ optional `story.md`).
- Task files: `speca-chat/stories/story-<NNN>/tasks/<TASK-ID>.task.yml` (+ optional `<TASK-ID>.task.md`).
- Board state: generated refs under `speca-chat/board/<status>/` (never edit manually).

Key Differences:
1. No movement of source task files between status folders; status is a field in YAML.
2. Acceptance criteria stored as a YAML list (`acceptance:`) not checkbox markdown.
3. Cross-task relationships use `related:` arrays (flat, validated).
4. Validation + lint scripts in `speca-chat/scripts/` replace former manifest tasks.
5. Derived artifacts (board, reports, lint outputs) are reproducible and excluded from manual edits.

Migration Guidance:
- Do not create new markdown tasks under `stories/` or `tasks/` at repo root.
- Convert any still-relevant legacy tasks into YAML using the template in `.github/instructions/COPILOT.instructions.md` Section 10.

For current governance see:
- `.github/instructions/COPILOT.instructions.md`
- `speca-chat/STRUCTURE_REPORT.md`

Last updated (deprecation): 2025-09-20.

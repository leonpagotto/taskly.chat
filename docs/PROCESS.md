> DEPRECATED DOCUMENT

# Development Process (Legacy)

This file described an earlier markdown task pipeline (story Backlog folders + global `tasks/` directories). The authoritative governance model has migrated to the YAML-based spec system under `speca-chat/`.

Current Source of Truth:
- Stories & Tasks: `speca-chat/stories/`
- Task Board Refs: `speca-chat/board/` (generated)
- Governance & Scripts: `.github/instructions/COPILOT.instructions.md` and `speca-chat/scripts/`

Key Changes vs Legacy Model:
1. Tasks are YAML (`*.task.yml`) not markdown header files.
2. Status lives in the task file; board entries are generated (no manual file moves between status folders).
3. Acceptance criteria stored in `acceptance:` arrays (no checkbox markdown lists).
4. Progress / rationale captured in `notes:` (multi-line) or optional `.task.md`.
5. Validation + lint scripts enforce schema, related links, acceptance quality.

Action Required:
- Do not add new content to this legacy file.
- Update any external references to point to the speca-chat structure.

For implementation details consult the current Copilot instructions and structure report:
- `speca-chat/STRUCTURE_REPORT.md`
- `.github/instructions/COPILOT.instructions.md`

Last updated (deprecation): 2025-09-20.

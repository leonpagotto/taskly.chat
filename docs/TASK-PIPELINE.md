> DEPRECATED DOCUMENT

# Task Pipeline Architecture (Legacy)

Replaced by YAML task + generated board reference model under `speca-chat/`. See:
- `.github/instructions/COPILOT.instructions.md`
- `speca-chat/STRUCTURE_REPORT.md`

## Overview

Legacy layer table removed; tasks no longer move between markdown status folders.

Status changes: edit `status:` in `<TASK-ID>.task.yml` then regenerate board.

## Replacement Metadata
See YAML template in Copilot instructions (Task YAML Canonical Template).

## Replacement Flow
1. Edit YAML task.
2. Run `pnpm spec:board` then `pnpm spec:validate`.
3. Commit YAML + regenerated board refs.

Legacy migration complete; scripts retained only for history.

Spec index replaced by board refs + reporting scripts under `speca-chat/scripts/`.

Validation now: `pnpm spec:validate` (AJV + heuristics).

Legacy governance principles superseded by checklist in Copilot instructions.

Future enhancements tracked centrally (see roadmap section in Copilot instructions).

## Commands Summary (Current)
| Action | Command |
|--------|---------|
| Generate Board | `pnpm spec:board` |
| Validate Structure | `pnpm spec:validate` |
| Delta Report | `pnpm spec:delta` |
| Lint Acceptance | `pnpm spec:lint-acceptance` |
| Update Timestamps | `pnpm spec:timestamps` |

---
Last updated (deprecation): 2025-09-20

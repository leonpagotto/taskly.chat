> DEPRECATED DOCUMENT

# Task Governance & Naming Guidelines (Legacy)

Replaced by YAML governance (`speca-chat/`). See Copilot instructions + structure report.

Legacy folder layout removed; tasks reside under per-story `tasks/` subfolder as YAML.

Naming: `<TASK-ID>.task.yml` (ID pattern unchanged: PREFIX-NNN). Optional narrative `<TASK-ID>.task.md`.

Uniqueness: enforced on `id` fields by validator; board refs must match.

Creation: copy template from Copilot instructions Section 10.

Status: edit `status:` and regenerate board (no file moves).

Validation: `validate-structure.mjs` + acceptance lint script.

Roadmap consolidated in Copilot instructions (Future Automation section).

Content hashing currently optional; future artifact may reintroduce.

Incremental sync now derived from git + YAML tasks; no manifest diff file required.

Rationale retained; see structure report for extended discussion.

---
Last updated (deprecation): 2025-09-20
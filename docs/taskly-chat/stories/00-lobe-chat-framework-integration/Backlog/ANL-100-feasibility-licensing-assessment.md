# Task: ANL-100
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: research
Related:
Owner:

## Summary
Feasibility & licensing assessment for adopting Lobe Chat (package vs vendored subset) including risk, maintenance, and upgrade path validation.

## Acceptance Criteria
- [ ] Inventory all required Lobe packages / submodules with versions.
- [ ] SPDX license review documented (no incompatible copyleft for distribution model) in `ARCHITECTURE.md`.
- [ ] Decision: npm consumption vs partial vendoring with rationale (table: option, pros, cons, decision) added to architecture doc.
- [ ] Risk table (API stability, release cadence, security posture) added.
- [ ] Version pin strategy defined (exact pin or caret + review cadence) and recorded.
- [ ] Upgrade evaluation checklist produced (impact areas, adapter regression tests to run).
- [ ] Output section in story file updated referencing findings.

## Implementation Notes
- Start with `pnpm why` after tentative install (dry prototype branch) to capture dependency graph size.
- Consider bundle impact snapshot pre-integration (baseline) for later PERF-105 comparisons.

## Progress Log
- 2025-09-19 Task created.

## Open Questions
- Any transitive licenses introducing patent clauses needing legal review?
- Are there optional peer dependencies we can skip initially?

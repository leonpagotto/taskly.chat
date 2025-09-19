# Task: OBS-108
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: chore
Related: task:IMP-101 task:IMP-103
Owner:

## Summary
Add telemetry & observability for key integration paths (mount success/failure, draft extraction latency, system prompt generation) to guide optimization.

## Acceptance Criteria
- [ ] Telemetry util (console/dev logger placeholder) emits events: `lobe.mount.error`, `lobe.draft.extract.duration`, `lobe.systemPrompt.build`.
- [ ] Extraction timing logged (median & p95 aggregated on dev hot reload summary or explicit command).
- [ ] Error path (mount failure) provides actionable message & feature flag guidance.
- [ ] Docs section: how to extend telemetry to production pipeline.
- [ ] No noisy logs in production build (guarded by NODE_ENV or feature flag).

## Implementation Notes
- Simple aggregator object resetting on HMR boundary.
- Future: integrate with external telemetry vendor.

## Progress Log
- 2025-09-19 Task created.

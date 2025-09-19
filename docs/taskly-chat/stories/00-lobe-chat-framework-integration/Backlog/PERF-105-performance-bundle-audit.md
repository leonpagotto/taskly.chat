# Task: PERF-105
Status: Backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-19
Type: research
Related: task:ANL-100 task:IMP-101
Owner:

## Summary
Bundle & runtime performance audit after minimal mount to ensure acceptable footprint and latency; produce optimization plan.

## Acceptance Criteria
- [ ] Baseline pre-integration bundle size (gz & brotli) recorded.
- [ ] Post-mount incremental size delta quantified (overall + top 5 modules) using `next build` stats.
- [ ] First load (TTFB / FCP via Lighthouse or Web Vitals) before vs after compared.
- [ ] At least 2 feasible optimization actions identified (e.g. dynamic import heavy panels, tree-shake icons) with estimated savings.
- [ ] Decision logged: actions now vs defer (with rationale) in architecture doc.
- [ ] Performance section appended to story referencing metrics.

## Implementation Notes
- Use Next.js build analysis plugin or `ANALYZE=true next build` if available.
- Consider deferring non-critical providers via dynamic() + ssr:false.

## Progress Log
- 2025-09-19 Task created.

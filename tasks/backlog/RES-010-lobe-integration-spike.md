# Task: RES-010
Status: backlog
Story: 00-lobe-chat-framework-integration
Created: 2025-09-20
Type: research
Related: task:IMP-101 task:IMP-102 task:IMP-103
Owner:

## Summary
Conduct a focused spike to determine the minimal viable pathway to replace the current `LobeChatMount` stub with a real, maintainable Lobe Chat integration (or validated vendored subset) without destabilizing existing abstractions.

## Research Questions
- Direct dependency vs vendored subset: which yields lower long-term maintenance?
- What is the minimal package (or set of modules) required for session handling, message rendering, and system prompt injection?
- How do we inject our `adaptInstructionLayers` output cleanly?
- Can draft extraction hook remain UI-agnostic (no coupling to Lobe internal events)?
- Licensing & NOTICE implications of selective vendoring.

## Acceptance Criteria
- Comparison matrix (direct git / package import vs selective vendoring) with pros/cons.
- Identified minimal interface surface we must implement or adapt.
- Risk list (upgrade churn, internal API volatility, styling collisions).
- Recommendation (chosen path) + justification.
- Next-step implementation outline (first 2–3 concrete tasks to execute after spike).

## Constraints
- No large-scale refactor; spike produces docs & outline only.
- Must not break current tests or adapter/ hook contracts.

## Implementation Notes
Explore repository structure of upstream Lobe Chat. Catalogue required components (message list, provider layer, system prompt injection points). Evaluate tree-shaking viability if imported directly.

## Progress Log
- 2025-09-20 Created spike task (backlog)

## Future Enhancements
- Performance benchmark comparing stub vs real integration.
- Theming / styling alignment plan.

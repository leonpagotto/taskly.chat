# PLAN-001 Conversation Persistence Implementation Plan

Story: 02 Retrieve Conversation History
Related Spec: SPEC-001
Status: Draft
Owner: Engineering

## Phases
1. Schema & Infra
2. Repository Layer
3. API Endpoints
4. UI Integration (list + detail)
5. Title Derivation (async)

## Phase 1: Schema & Infra
- Add `prisma/` directory at repo root (or dedicated `@taskly/data` package if isolation desired) with schema defining Conversation and Message.
- Configure SQLite datasource for dev; enable migrations.
- Add prisma client generation step to root build or dedicated script.

## Phase 2: Repository Layer
- Create lightweight data access module (ConversationRepo, MessageRepo) with methods:
  - createConversation({ projectId?, participants, firstMessage? })
  - listConversationsByUser(userId, { limit, offset })
  - getConversation(id)
  - appendMessage(conversationId, { role, content, meta? })
  - listMessages(conversationId, { limit, beforeId? }) for pagination

## Phase 3: API Endpoints
Implement Next.js route handlers aligning with spec.
Validation via Zod schemas.
Return DTO shapes decoupled from internal prisma models.

## Phase 4: UI Integration
- Conversation sidebar: list (title or fallback to first snippet)
- Selecting conversation loads message history
- New conversation button triggers create + initial message send

## Phase 5: Title Derivation
- Background job (edge-friendly) analyzing first user message
- If no title set after first 2 messages, derive using simple heuristic (first 5 words) placeholder for later AI summarization.

## Cross-Cutting Concerns
- Error normalization (repository vs API surface)
- Logging minimal instrumentation around persistence failures
- Data validation at boundary (API) only

## Out of Scope
- Vector embedding
- Full-text search
- Soft delete / archival

## Acceptance Criteria
- All repository functions unit tested with in-memory SQLite (shadow db)
- Endpoints return correct pagination metadata
- Title derivation job updates existing conversation without race conditions

## Risks & Mitigations
- Migration conflicts: keep schema small, incremental PRs.
- Performance scaling: plan PostgreSQL migration early.

## Next Steps
1. Decide package placement (`@taskly/data` vs root) before schema commit.
2. Create DEV tasks for each phase.
3. Implement Phase 1 in small PR.

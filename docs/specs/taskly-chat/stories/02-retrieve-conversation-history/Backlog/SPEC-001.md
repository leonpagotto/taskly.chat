# SPEC-001 Conversation Persistence Model

Story: 02 Retrieve Conversation History
Status: Draft
Owner: Engineering Architecture
Tags: persistence, conversation, storage

## Goal
Persist user <-> AI message exchanges so that past context can be retrieved, enabling continuity, personalization, and downstream memory features.

## Non-Goals
- Vector semantic search (future story)
- Cross-project shared memory (future)
- Encryption at rest (tracked separately)

## Core Concepts
- Conversation: Logical thread bound to a project (or global) and participant set.
- Message: Immutable user or AI utterance with metadata.
- Turn: Pairing of user message and subsequent AI response (derivable; not stored explicitly).

## Data Model (Initial)
Conversation
- id (uuid)
- projectId (nullable for global)
- title (string, nullable until derived)
- createdAt, updatedAt
- participants: user ids (array)

Message
- id (uuid)
- conversationId (fk)
- role (user|assistant|system)
- content (text)
- tokensEstimate (int, nullable)
- createdAt
- meta (jsonb) // parse artifacts, task draft id references, etc.

## Storage Backend
Phase 1: SQLite (file) via Prisma for local dev.
Phase 2: PostgreSQL for production (migration path ensured by Prisma schema).

## Access Patterns
- Append new message(s) (hot path)
- Fetch last N messages for a conversation (chat rendering)
- Fetch conversation list for a user (with last message preview)
- Fetch single conversation with full history (pagination > 100 messages)

## Derived Behaviors
- Auto-generate conversation title from first user message (deferred background job)
- Archival flag (future) after inactivity threshold

## Constraints & Limits
- Message content max 8KB plain text (soft validation)
- Conversations capped at 10k messages before archival recommendation

## API Surfaces (Planned)
- POST /api/conversations -> create (optionally first message)
- GET /api/conversations -> list (latest first)
- GET /api/conversations/:id -> detail (include messages with pagination)
- POST /api/conversations/:id/messages -> append message

## Open Questions
- Do we need optimistic UI ids before persistence? (Likely yes)
- Should we support system messages injection history separately? (Maybe store as role=system in same table for simplicity)

## Acceptance Criteria
- Prisma schema drafted (see PLAN-001)
- Basic CRUD endpoints defined and stubbed
- Unit tests for repository layer (future test task)

## Risks
- Early schema churn if memory features accelerate; mitigated by migration tooling.

## Appendix A: Schema Placement Decision
Decision (DEV-020): Use dedicated `@taskly/data` package (`packages/data`) to house Prisma schema, client generation, and future repository utilities. Advantage: encapsulation + clearer ownership, easier extraction if backend splits from Next.js.

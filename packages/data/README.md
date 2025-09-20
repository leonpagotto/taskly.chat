# @taskly/data

Centralized persistence layer: Prisma schema, generated client, and (later) repository utilities.

## Scripts
- `pnpm --filter @taskly/data run prisma:generate`
- `pnpm --filter @taskly/data run build`

## Notes
Consumer packages should not import internal Prisma types directly; expose higher-level repositories (future) or DTOs.

## Spec Integration
Feature and persistence changes should reference a task ID from `speca-chat/` (e.g., `IMP-101`). Use that ID in commit messages to maintain traceability with the canonical backlog.

## Governance Hooks
Repository validation (board + schema) does not run inside this package directly; it is invoked at the root pre-commit. Data layer modifications should not bypass those checks.

## Usage Example
```ts
import { ConversationRepo, MessageRepo } from '@taskly/data';

async function demo() {
	const convo = await ConversationRepo.create({
		participants: ['user123'],
		firstMessage: { role: 'user', content: 'Plan my day' }
	});
	await MessageRepo.append(convo.id, { role: 'assistant', content: 'Sure, let\'s start.' });
	const messages = await MessageRepo.list(convo.id);
	console.log(messages.map(m => m.content));
}
```

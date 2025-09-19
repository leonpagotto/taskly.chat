import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from './client';
import { ConversationRepo, MessageRepo } from './repositories';

// Use a separate sqlite file per test run or just reuse dev.db (acceptable for simple smoke tests)

describe('Conversation & Message Repositories', () => {
  beforeAll(async () => {
    // Clean tables for deterministic tests
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
  });

  it('creates a conversation with optional first message', async () => {
    const convo = await ConversationRepo.create({
      participants: ['userA', 'userB'],
      firstMessage: { role: 'user', content: 'Hello there', meta: { draft: false } }
    });
    expect(convo.id).toBeTruthy();
    expect(convo.participants).toContain('userA');
    expect(convo.firstMessage?.content).toBe('Hello there');
  });

  it('lists conversations by participant', async () => {
    const list = await ConversationRepo.listByParticipant('userA');
    expect(list.length).toBeGreaterThan(0);
  });

  it('appends and lists messages with chronological order', async () => {
    const [first] = await ConversationRepo.listByParticipant('userA');
    await MessageRepo.append(first.id, { role: 'assistant', content: 'Hi! How can I help?' });
    await MessageRepo.append(first.id, { role: 'user', content: 'Need a task created.' });

    const messages = await MessageRepo.list(first.id, { limit: 10 });
    expect(messages.length).toBeGreaterThanOrEqual(3); // includes initial firstMessage
    // Ensure chronological order ascending by createdAt
    for (let i = 1; i < messages.length; i++) {
      expect(messages[i].createdAt.getTime()).toBeGreaterThanOrEqual(messages[i - 1].createdAt.getTime());
    }
  });
});

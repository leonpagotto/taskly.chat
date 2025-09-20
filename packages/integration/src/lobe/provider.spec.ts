import { describe, it, expect } from 'vitest';
import { resolveLobeProvider } from './provider';

describe('HeuristicLobeProvider', () => {
  it('produces intent in reply content', async () => {
    const provider = resolveLobeProvider();
    const reply = await provider.generateReply([
      { id: 'u1', role: 'user', content: 'Schedule a meeting next week' }
    ]);
    expect(reply.content).toMatch(/Intent:/i);
  });
});

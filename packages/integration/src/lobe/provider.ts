import { LobeChatMessage, LobeChatProvider, LobeChatProviderOptions, LobeReply } from './types';

function detectIntent(latest: string) {
  const lower = latest.toLowerCase();
  if (/schedule|calendar|meeting/.test(lower)) return 'schedule';
  if (/research|investigate|look into/.test(lower)) return 'research';
  if (/update|modify|change/.test(lower)) return 'update-task';
  if (/create|add|make|new/.test(lower)) return 'create-task';
  return 'general';
}

export class HeuristicLobeProvider implements LobeChatProvider {
  async generateReply(messages: LobeChatMessage[], options?: LobeChatProviderOptions): Promise<LobeReply> {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const latest = lastUser?.content || '';
    const intent = detectIntent(latest);
    const wc = latest.split(/\s+/).filter(Boolean).length;
    const sys = options?.systemPrompt ? ' Guided.' : '';
    return { id: 'lobe-'+Date.now(), content: `Intent:${intent}; Words:${wc}.${sys}` };
  }
}

export function resolveLobeProvider(): LobeChatProvider {
  return new HeuristicLobeProvider();
}

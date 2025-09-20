import { NextRequest } from 'next/server';
import { generateModelResponse, resolveDefaultProvider } from '@taskly/integration';
import { ChatMessage } from '@taskly/core';

export const runtime = 'nodejs';

function quickIntentAndTasks(latest: string) {
  const text = latest.trim();
  const lower = text.toLowerCase();
  const intent = [
    { key: 'create-task', hints: ['create','add','make','new task','todo'] },
    { key: 'update-task', hints: ['update','change','modify','edit'] },
    { key: 'schedule', hints: ['schedule','calendar','meeting','meet'] },
    { key: 'research', hints: ['research','investigate','look into','analyze'] }
  ].find(grp => grp.hints.some(h => lower.includes(h)))?.key || 'general';
  // naive task line extraction using punctuation split
  const candidates = text.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 4 && /[a-z]/i.test(s));
  const tasks = candidates.slice(0,3).map((c,i)=>({ id: 'draft-'+(i+1), title: c.length>80? c.slice(0,77)+'…': c, confidence: 0.4 + Math.min(0.5, c.length/160) }));
  return { intent, tasks };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const systemPrompt: string | undefined = body.systemPrompt;
    const latest = [...messages].reverse().find(m => m.role === 'user');
    if (!latest) {
      return new Response(JSON.stringify({ error: true, message: 'No user message supplied' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const heuristic = quickIntentAndTasks(latest.content);
    // Attempt provider call; if provider fails, fallback to heuristic summary string
    let providerContent: string | null = null;
    try {
      const provider = (body.provider as string | undefined) || resolveDefaultProvider();
      const resp = await generateModelResponse(messages, { systemPrompt, provider: provider as any });
      providerContent = resp.content;
    } catch {
      providerContent = null;
    }
    const content = providerContent || `Intent: ${heuristic.intent}; Drafts: ${heuristic.tasks.map(t=>t.title).join(' | ')}`;
    return new Response(JSON.stringify({ id: 'assistant-'+Date.now(), content, intent: heuristic.intent, drafts: heuristic.tasks }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: true, message: e?.message || 'unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

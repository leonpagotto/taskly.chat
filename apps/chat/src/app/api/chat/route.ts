import { NextRequest } from 'next/server';
import { generateModelResponse, resolveDefaultProvider } from '@taskly/integration';
import { ChatMessage } from '@taskly/core';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const systemPrompt: string | undefined = body.systemPrompt;
  const provider = resolveDefaultProvider();
  const resp = await generateModelResponse(messages, { systemPrompt, provider });
    return new Response(JSON.stringify({ id: resp.id, content: resp.content }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: true, message: e?.message || 'unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

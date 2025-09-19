import { NextRequest, NextResponse } from 'next/server';
import { extractTaskDrafts } from '@taskly/ai';
import { ChatMessage } from '@taskly/core';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content } = body as { content?: string };
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }
  const chatMsg: ChatMessage = { id: 'temp', role: 'user', content, createdAt: new Date().toISOString() };
  const result = extractTaskDrafts(chatMsg);
  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from 'next/server';
import { parseUserInput } from '@taskly/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: unknown = body?.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 2000) {
      return NextResponse.json({ error: { code: 'BAD_INPUT', message: 'Invalid or too long text' } }, { status: 400 });
    }
    const result = parseUserInput(text);
    let proposedTask: any = undefined;
    if (result.intent === 'create_task' && !result.missing.includes('due_date')) {
      proposedTask = {
        title: text.slice(0, 80),
        description: result.entities.description,
        due_date: (result.entities as any).due_date,
        priority: (result.entities as any).priority || 'normal'
      };
    }
    return NextResponse.json({ ...result, proposedTask });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: e?.message || 'Internal error' } }, { status: 500 });
  }
}

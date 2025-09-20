import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory mock dataset (would be replaced by DB fetch)
// Using a stable seeded array for now.
interface ConversationMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string; // ISO timestamp
}

// Generate mock messages on first load (simulate recent history ~ 120 messages)
const MESSAGES: ConversationMessage[] = (() => {
  const arr: ConversationMessage[] = [];
  const now = Date.now();
  for (let i = 0; i < 120; i++) {
    const created = new Date(now - (120 - i) * 60_000); // one minute apart
    arr.push({
      id: `m-${i + 1}`,
      userId: 'demo-user',
      role: i % 5 === 0 ? 'assistant' : 'user',
      content: i % 5 === 0 ? `Assistant reply #${i + 1}` : `User message #${i + 1}`,
      createdAt: created.toISOString(),
    });
  }
  return arr;
})();

// Query parameters: cursor (ISO timestamp), direction (prev|next), limit (default 50), start, end
// We implement forward pagination: provide a cursor which is the createdAt of last received message; we return newer messages after that cursor.
// If no cursor provided, return the earliest page (oldest messages first) to allow chronological build.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 100);
  const cursor = searchParams.get('cursor'); // expecting createdAt ISO of last seen message
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let filtered = [...MESSAGES];

  if (start) {
    const startDate = new Date(start).getTime();
    if (!isNaN(startDate)) {
      filtered = filtered.filter(m => new Date(m.createdAt).getTime() >= startDate);
    }
  }
  if (end) {
    const endDate = new Date(end).getTime();
    if (!isNaN(endDate)) {
      filtered = filtered.filter(m => new Date(m.createdAt).getTime() < endDate);
    }
  }

  // Sort ascending by createdAt
  filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let startIndex = 0;
  if (cursor) {
    const idx = filtered.findIndex(m => m.createdAt === cursor);
    if (idx >= 0) {
      startIndex = idx + 1; // start after the cursor
    }
  }

  const page = filtered.slice(startIndex, startIndex + limit);
  const nextCursor = page.length === limit ? page[page.length - 1].createdAt : null;
  const hasMore = nextCursor != null && (filtered.findIndex(m => m.createdAt === nextCursor) < filtered.length - 1);

  return NextResponse.json({
    messages: page,
    page: {
      nextCursor,
      hasMore,
      limit,
    }
  });
}

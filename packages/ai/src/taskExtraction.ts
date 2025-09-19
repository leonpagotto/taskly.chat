import { TaskDraft, ChatMessage } from '@taskly/core';

export interface TaskExtractionResult {
  drafts: TaskDraft[];
  rawModelOutput?: string;
}

export interface TaskExtractorOptions {
  maxDrafts?: number;
  confidenceFloor?: number; // filter by minimum confidence
}

// Placeholder heuristic implementation until model integration.
export function extractTaskDrafts(message: ChatMessage, opts: TaskExtractorOptions = {}): TaskExtractionResult {
  const { maxDrafts = 3, confidenceFloor = 0.2 } = opts;
  const sentences = message.content.split(/(?<=[.!?])\s+/).slice(0, 5);
  const drafts: TaskDraft[] = [];
  for (const s of sentences) {
    const maybe = toDraft(s.trim());
    if (maybe && maybe.confidence >= confidenceFloor) drafts.push(maybe);
    if (drafts.length >= maxDrafts) break;
  }
  return { drafts };
}

function toDraft(sentence: string): TaskDraft | null {
  if (!sentence) return null;
  const lower = sentence.toLowerCase();
  const taskVerbs = ['create', 'write', 'draft', 'plan', 'schedule', 'refactor', 'update', 'fix', 'investigate'];
  if (!taskVerbs.some(v => lower.startsWith(v))) return null;
  const title = sentence.replace(/^[A-Z][a-z]+:\s*/, '').slice(0, 120);
  return {
    title,
    description: sentence.length > 120 ? sentence : undefined,
    confidence: 0.4 // static heuristic
  };
}

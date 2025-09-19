import { ParseResult, UserIntent } from '@taskly/core';

interface InternalParseNotes {
  notes: string[];
}

const INTENT_PATTERNS: Record<UserIntent, RegExp[]> = {
  create_task: [/^(create|add|make|draft|write)\b.*task/i, /\bto-do\b/i],
  create_reminder: [/^(remind|remember|ping|notify)\b/i, /\breminder\b/i],
  capture_idea: [/^(note|remember|capture|save)\b.*idea/i, /\bidea\b/i],
  unknown: []
};

const PRIORITY_REGEX = /\b(low|medium|normal|high|urgent|priority (low|normal|high))\b/i;
const DATE_HINT_REGEX = /\b(today|tomorrow|next week|next monday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})\b/i;
const TIME_HINT_REGEX = /\b(\d{1,2}:\d{2}(am|pm)?|noon|morning|evening)\b/i;

export function parseUserInput(text: string): ParseResult {
  const trimmed = text.trim();
  const notes: string[] = [];
  if (!trimmed) {
    return {
      intent: 'unknown',
      entities: {},
      confidence: 0,
      missing: [],
      raw: { text, notes: ['empty'] }
    };
  }

  const intent = detectIntent(trimmed, notes);
  const { entities, missing, confidenceAdjust } = extractEntities(intent, trimmed, notes);
  const baseConfidence = intent === 'unknown' ? 0.2 : 0.55;
  const confidence = Math.min(1, baseConfidence + confidenceAdjust);

  return {
    intent,
    entities,
    confidence,
    missing,
    raw: { text, notes }
  };
}

function detectIntent(text: string, notes: string[]): UserIntent {
  for (const intent of Object.keys(INTENT_PATTERNS) as UserIntent[]) {
    if (intent === 'unknown') continue;
    if (INTENT_PATTERNS[intent].some(r => r.test(text))) {
      notes.push(`intent:${intent}`);
      return intent;
    }
  }
  // fallback heuristic
  if (/\b(remind|reminder)\b/i.test(text)) return 'create_reminder';
  if (/\b(task|todo|to-do)\b/i.test(text)) return 'create_task';
  if (/\bidea\b/i.test(text)) return 'capture_idea';
  notes.push('intent:unknown');
  return 'unknown';
}

function extractEntities(intent: UserIntent, text: string, notes: string[]): { entities: any; missing: string[]; confidenceAdjust: number } {
  const missing: string[] = [];
  let confidenceAdjust = 0;
  const entities: any = {};

  // Shared description heuristic
  entities.description = text;

  if (intent === 'create_task') {
    // priority
    const p = text.match(PRIORITY_REGEX);
    if (p) {
      const raw = p[1].toLowerCase();
      entities.priority = raw.includes('urgent') ? 'high' : raw.replace('priority ','') as any;
      confidenceAdjust += 0.1;
      notes.push('priority:found');
    }
    // due date
    const d = text.match(DATE_HINT_REGEX);
    if (d) {
      entities.due_date = normalizeDateToken(d[1]);
      confidenceAdjust += 0.1;
      notes.push('due:found');
    } else {
      missing.push('due_date');
    }
  } else if (intent === 'create_reminder') {
    const t = text.match(TIME_HINT_REGEX);
    if (t) {
      entities.reminder_time = normalizeTimeToken(t[1]);
      confidenceAdjust += 0.1;
      notes.push('time:found');
    } else {
      missing.push('reminder_time');
    }
  } else if (intent === 'capture_idea') {
    // Could extract topic hashtags (#foo)
    const topic = text.match(/#(\w+)/);
    if (topic) {
      entities.topic = topic[1];
      confidenceAdjust += 0.05;
      notes.push('idea:topic');
    }
  }
  return { entities, missing, confidenceAdjust };
}

function normalizeDateToken(token: string): string {
  const lower = token.toLowerCase();
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) return lower;
  const today = new Date();
  if (lower === 'today') return today.toISOString().split('T')[0];
  if (lower === 'tomorrow') {
    const d = new Date(today.getTime() + 86400000);
    return d.toISOString().split('T')[0];
  }
  // naive weekday next occurrence
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const idx = weekdays.indexOf(lower);
  if (idx >= 0) {
    const delta = (idx - today.getDay() + 7) % 7 || 7;
    const d = new Date(today.getTime() + delta * 86400000);
    return d.toISOString().split('T')[0];
  }
  return today.toISOString().split('T')[0];
}

function normalizeTimeToken(token: string): string {
  const lower = token.toLowerCase();
  if (/^\d{1,2}:\d{2}(am|pm)?$/.test(lower)) {
    // convert to ISO today
    const today = new Date();
    let [time, ap] = lower.match(/^(\d{1,2}:\d{2})(am|pm)?$/)!.slice(1) as any;
    let [h, m] = time.split(':').map(Number);
    if (ap) {
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
    }
    today.setHours(h, m, 0, 0);
    return today.toISOString();
  }
  if (lower === 'noon') {
    const d = new Date(); d.setHours(12,0,0,0); return d.toISOString();
  }
  const d = new Date(); d.setHours(9,0,0,0); return d.toISOString();
}

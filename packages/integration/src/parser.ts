export interface ParsedStoryHeader {
  kind: 'story';
  title: string;
  slug: string;
  status: string;
  created: string;
  owner?: string;
  area?: string;
  raw: string;
  filePath?: string;
}

export interface ParsedTaskHeader {
  kind: 'task';
  id: string;
  status: string;
  story: string;
  created: string;
  type: string;
  related?: string[];
  owner?: string;
  raw: string;
  warnings: string[];
  filePath?: string;
}

export type ParsedHeader = ParsedStoryHeader | ParsedTaskHeader;

const STORY_REQUIRED = ['# Story:','Slug:','Status:','Created:'];
const TASK_REQUIRED = ['# Task:','Status:','Story:','Created:','Type:'];

export interface ParseOptions {
  maxLines?: number;
}

export function parseHeaders(content: string, opts: ParseOptions = {}): ParsedHeader | null {
  const max = opts.maxLines || 40;
  const lines = content.split(/\r?\n/).slice(0,max);
  const isStory = lines[0]?.startsWith('# Story:');
  const isTask = lines[0]?.startsWith('# Task:');
  if (!isStory && !isTask) return null;
  if (isStory) return parseStory(lines, content);
  return parseTask(lines, content);
}

function parseStory(lines: string[], raw: string): ParsedStoryHeader {
  const map: Record<string,string> = {};
  for (const l of lines) {
    if (l.startsWith('## ')) break;
    const m = l.match(/^([#A-Za-z][A-Za-z ]*?):\s*(.*)$/);
    if (m) map[m[1].trim()] = m[2].trim();
  }
  for (const r of STORY_REQUIRED) if (!lines.some(l=>l.startsWith(r))) throw new Error(`Missing story header field: ${r}`);
  const title = map['# Story'] || lines[0].replace(/^# Story:\s*/, '').trim();
  return {
    kind: 'story',
    title,
    slug: map['Slug'] || '',
    status: (map['Status']||'').toLowerCase(),
    created: map['Created'] || '',
    owner: map['Owner'] || undefined,
    area: map['Area'] || undefined,
    raw
  };
}

function parseTask(lines: string[], raw: string): ParsedTaskHeader {
  const map: Record<string,string> = {};
  const warnings: string[] = [];
  for (const l of lines) {
    if (l.startsWith('## ')) break;
    const m = l.match(/^([#A-Za-z][A-Za-z -]*?):\s*(.*)$/);
    if (m) map[m[1].trim()] = m[2].trim();
  }
  for (const r of TASK_REQUIRED) if (!lines.some(l=>l.startsWith(r))) throw new Error(`Missing task header field: ${r}`);
  const idLine = lines[0];
  const id = idLine.replace(/^# Task:\s*/, '').trim().split(/\s+/)[0];
  const relatedRaw = map['Related'] || '';
  const related = relatedRaw ? relatedRaw.split(/[\s,]+/).filter(Boolean) : [];
  if (related.some(r=>!/^((task|story):|PR:#|#)/.test(r))) warnings.push('Unexpected related token format');
  return {
    kind: 'task',
    id,
    status: (map['Status']||'').toLowerCase(),
    story: map['Story'] || 'NONE',
    created: map['Created'] || '',
    type: (map['Type']||'').toLowerCase(),
    related: related.length?related:undefined,
    owner: map['Owner'] || undefined,
    raw,
    warnings
  };
}

export interface RepoScanResult {
  stories: ParsedStoryHeader[];
  tasks: ParsedTaskHeader[];
  errors: { file: string; error: string }[];
}

export function scanRepository(files: { path: string; content: string }[]): RepoScanResult {
  const stories: ParsedStoryHeader[] = [];
  const tasks: ParsedTaskHeader[] = [];
  const errors: { file: string; error: string }[] = [];
  for (const f of files) {
    try {
      const parsed = parseHeaders(f.content);
      if (!parsed) continue;
  if (parsed.kind === 'story') stories.push({ ...parsed, filePath: f.path });
  else tasks.push({ ...parsed, filePath: f.path });
    } catch (e:any) {
      errors.push({ file: f.path, error: e.message });
    }
  }
  return { stories, tasks, errors };
}

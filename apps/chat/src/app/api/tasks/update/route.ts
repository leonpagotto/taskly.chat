import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getRoots() {
  const ROOT = process.cwd();
  return { ROOT, PIPELINE_ROOT: path.join(ROOT,'tasks'), STORIES_ROOT: path.join(ROOT,'stories') };
}
const ACTIVE_STATUSES = new Set(['todo','in-progress','review','done']);

async function findTaskFile(id: string): Promise<string|null> {
  const { PIPELINE_ROOT, STORIES_ROOT } = getRoots();
  // Search active pipeline folders first
  for (const st of ['todo','in-progress','review','done']) {
    const dir = path.join(PIPELINE_ROOT, st);
    try {
      const entries = await fs.readdir(dir);
      for (const e of entries) {
        if (e.startsWith(id+'-') || e === id + '.md') return path.join(dir,e);
      }
    } catch {}
  }
  // Search story backlogs (Backlog folders) for backlog tasks
  async function *walk(dir: string): AsyncGenerator<string> {
    let entries: any[] = [];
    try { entries = await fs.readdir(dir,{withFileTypes:true}); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) yield* walk(full); else if (entry.isFile() && entry.name.endsWith('.md')) yield full;
    }
  }
  for await (const f of walk(STORIES_ROOT)) {
    const base = path.basename(f);
    if (base.startsWith(id+'-') || base === id + '.md') return f;
  }
  return null;
}

async function updateStatusLine(file: string, newStatus: string) {
  const raw = await fs.readFile(file,'utf8');
  const lines = raw.split(/\r?\n/);
  let changed = false;
  for (let i=0;i<lines.length;i++) {
    if (lines[i].startsWith('Status:')) {
      lines[i] = 'Status: ' + newStatus;
      changed = true;
      break;
    }
    if (lines[i].startsWith('## ')) break; // stop if hit body before finding Status
  }
  if (!changed) throw new Error('Status line not found in header');
  await fs.writeFile(file, lines.join('\n'),'utf8');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, toStatus } = body || {};
    if (!id || !toStatus) return NextResponse.json({ error: 'id and toStatus required' }, { status: 400 });
    const normalized = String(toStatus).toLowerCase();
    if (!ACTIVE_STATUSES.has(normalized)) return NextResponse.json({ error: 'Unsupported status' }, { status: 400 });
  const { PIPELINE_ROOT } = getRoots();
  const file = await findTaskFile(id);
    if (!file) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Determine target directory & move if needed
    const targetDir = path.join(PIPELINE_ROOT, normalized);
    await fs.mkdir(targetDir, { recursive: true });
    const base = path.basename(file);
    const target = path.join(targetDir, base);

    // If already in correct directory, just update status line
    if (path.dirname(file) !== targetDir) {
      await fs.rename(file, target);
    }
    await updateStatusLine(target, normalized);

    return NextResponse.json({ ok: true, id, status: normalized });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Update failed' }, { status: 500 });
  }
}

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
  for (const st of ['todo','in-progress','review','done']) {
    const dir = path.join(PIPELINE_ROOT, st);
    try { const entries = await fs.readdir(dir); for (const e of entries) if (e.startsWith(id+'-')|| e===id+'.md') return path.join(dir,e); } catch {}
  }
  async function *walk(dir: string): AsyncGenerator<string> {
    let entries: any[] = [];
    try { entries = await fs.readdir(dir,{withFileTypes:true}); } catch { return; }
    for (const entry of entries) { const full = path.join(dir, entry.name); if (entry.isDirectory()) yield* walk(full); else if (entry.isFile() && entry.name.endsWith('.md')) yield full; }
  }
  for await (const f of walk(STORIES_ROOT)) { const base = path.basename(f); if (base.startsWith(id+'-')|| base===id+'.md') return f; }
  return null;
}

async function updateStatusLine(file: string, newStatus: string) {
  const raw = await fs.readFile(file,'utf8');
  const lines = raw.split(/\r?\n/);
  for (let i=0;i<lines.length;i++) {
    if (lines[i].startsWith('Status:')) { lines[i] = 'Status: ' + newStatus; break; }
    if (lines[i].startsWith('## ')) break;
  }
  await fs.writeFile(file, lines.join('\n'),'utf8');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moves } = body || {};
    if (!Array.isArray(moves) || !moves.length) return NextResponse.json({ error: 'moves array required' }, { status: 400 });
    const results: any[] = [];
    for (const m of moves) {
      const { id, toStatus } = m || {};
      if (!id || !toStatus) { results.push({ id, error: 'invalid move spec' }); continue; }
      const normalized = String(toStatus).toLowerCase();
      if (!ACTIVE_STATUSES.has(normalized)) { results.push({ id, error: 'unsupported status' }); continue; }
  const { PIPELINE_ROOT } = getRoots();
  const file = await findTaskFile(id);
      if (!file) { results.push({ id, error: 'not found' }); continue; }
      const targetDir = path.join(PIPELINE_ROOT, normalized);
      await fs.mkdir(targetDir,{recursive:true});
      const base = path.basename(file);
      const target = path.join(targetDir, base);
      if (path.dirname(file) !== targetDir) await fs.rename(file, target);
      await updateStatusLine(target, normalized);
      results.push({ id, status: normalized });
    }
    return NextResponse.json({ ok: true, results });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Batch update failed' }, { status: 500 });
  }
}

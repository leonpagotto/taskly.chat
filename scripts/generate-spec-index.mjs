#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');
const OUTPUT = path.resolve(process.cwd(), 'docs/taskly-chat/SPEC-INDEX.md');

async function readStoryMeta(storyDir) {
  const storyPath = path.join(storyDir, 'story.md');
  const exists = await fs.access(storyPath).then(()=>true).catch(()=>false);
  if (!exists) return null;
  const raw = await fs.readFile(storyPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  // Find first markdown H1 style line beginning with '#'
  const titleLine = lines.find(l => /^#\s+/.test(l.trim())) || '';
  const title = titleLine.replace(/^#\s+/, '').trim();
  const statusLine = lines.find(l => /^Status:\s*/i.test(l));
  const status = statusLine ? statusLine.split(':')[1].trim() : 'Unknown';
  return { title, status };
}

async function collectTasks(storyDir) {
  const statuses = ['Backlog','InProgress','Review','Done'];
  const counts = {};
  const mtimes = [];
  for (const st of statuses) {
    const folder = path.join(storyDir, st);
    let files = [];
    try {
      const entries = await fs.readdir(folder, { withFileTypes: true });
      files = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => path.join(folder, e.name));
    } catch { files = []; }
    counts[st] = files.length;
    for (const f of files) {
      try { const stat = await fs.stat(f); mtimes.push(stat.mtimeMs); } catch {}
    }
  }
  const latest = mtimes.length ? new Date(Math.max(...mtimes)).toISOString() : '';
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const done = counts.Done || 0;
  const pct = total ? Math.round((done/total)*100) : null;
  return { counts, latest, total, done, pct };
}

function parseStoryFolderName(name) {
  const match = name.match(/^(\d+)-(.*)$/);
  if (!match) return null;
  return { number: parseInt(match[1], 10), slug: match[2] };
}

async function main() {
  const dirs = await fs.readdir(ROOT, { withFileTypes: true });
  const stories = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const meta = parseStoryFolderName(d.name);
    if (!meta) continue;
    const full = path.join(ROOT, d.name);
    const storyMeta = await readStoryMeta(full);
    if (!storyMeta) continue;
  const taskData = await collectTasks(full);
  stories.push({ ...meta, ...storyMeta, ...taskData });
  }
  stories.sort((a,b) => a.number - b.number);

  if (process.argv.includes('--json')) {
    const json = stories.map(s => ({
      id: `${String(s.number).padStart(2,'0')}-${s.slug}`,
      title: s.title,
      status: s.status,
      backlog: s.counts.Backlog,
      inProgress: s.counts.InProgress,
      review: s.counts.Review,
      done: s.counts.Done,
      total: s.total,
      pctDone: s.pct,
      lastUpdated: s.latest
    }));
    console.log(JSON.stringify(json,null,2));
    return;
  }

  const lines = [];
  lines.push('# SPEC INDEX');
  lines.push('Generated: ' + new Date().toISOString());
  lines.push('');
  lines.push('| Story | Title | Status | Backlog | InProgress | Review | Done | %Done | LastUpdated |');
  lines.push('|-------|-------|--------|---------|------------|--------|------|-------|-------------|');
  for (const s of stories) {
    const id = `${String(s.number).padStart(2,'0')}-${s.slug}`;
    const pct = s.pct === null ? '--' : `${s.pct}%`;
    lines.push(`| ${id} | ${s.title} | ${s.status} | ${s.counts.Backlog} | ${s.counts.InProgress} | ${s.counts.Review} | ${s.counts.Done} | ${pct} | ${s.latest} |`);
  }
  lines.push('');
  await fs.writeFile(OUTPUT, lines.join('\n'), 'utf8');
  console.log('Wrote spec index to', OUTPUT);
}

main().catch(err => { console.error(err); process.exit(1); });

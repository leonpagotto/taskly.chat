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

async function countTasks(storyDir) {
  const statuses = ['Backlog','InProgress','Review','Done'];
  const counts = {};
  for (const st of statuses) {
    const folder = path.join(storyDir, st);
    let c = 0;
    try {
      const entries = await fs.readdir(folder, { withFileTypes: true });
      c = entries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
    } catch { c = 0; }
    counts[st] = c;
  }
  return counts;
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
    const counts = await countTasks(full);
    stories.push({ ...meta, ...storyMeta, counts });
  }
  stories.sort((a,b) => a.number - b.number);

  const lines = [];
  lines.push('# SPEC INDEX');
  lines.push('Generated: ' + new Date().toISOString());
  lines.push('');
  lines.push('| Story | Title | Status | Backlog | InProgress | Review | Done |');
  lines.push('|-------|-------|--------|---------|------------|--------|------|');
  for (const s of stories) {
    lines.push(`| ${String(s.number).padStart(2,'0')}-${s.slug} | ${s.title} | ${s.status} | ${s.counts.Backlog} | ${s.counts.InProgress} | ${s.counts.Review} | ${s.counts.Done} |`);
  }
  lines.push('');
  await fs.writeFile(OUTPUT, lines.join('\n'), 'utf8');
  console.log('Wrote spec index to', OUTPUT);
}

main().catch(err => { console.error(err); process.exit(1); });

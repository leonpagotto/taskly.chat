#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const STORIES_ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');
const PIPELINE_ROOT = path.resolve(process.cwd(), 'tasks');
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

async function collectStoryBacklogTasks(storyDir) {
  const folder = path.join(storyDir, 'Backlog');
  try {
    const entries = await fs.readdir(folder, { withFileTypes: true });
    return entries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
  } catch { return 0; }
}

async function collectPipelineCounts() {
  const statuses = ['todo','in-progress','review','done'];
  const counts = { todo:0, 'in-progress':0, review:0, done:0 };
  const mtimes = [];
  for (const st of statuses) {
    const folder = path.join(PIPELINE_ROOT, st);
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
  return { counts, latest };
}

function parseStoryFolderName(name) {
  const match = name.match(/^(\d+)-(.*)$/);
  if (!match) return null;
  return { number: parseInt(match[1], 10), slug: match[2] };
}

async function main() {
  const dirs = await fs.readdir(STORIES_ROOT, { withFileTypes: true });
  const stories = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const meta = parseStoryFolderName(d.name);
    if (!meta) continue;
    const full = path.join(STORIES_ROOT, d.name);
    const storyMeta = await readStoryMeta(full);
    if (!storyMeta) continue;
    const backlogCount = await collectStoryBacklogTasks(full);
    stories.push({ ...meta, ...storyMeta, backlog: backlogCount });
  }
  stories.sort((a,b) => a.number - b.number);

  // Global pipeline aggregate counts
  const pipeline = await collectPipelineCounts();
  const pipelineTotal = pipeline.counts['todo'] + pipeline.counts['in-progress'] + pipeline.counts['review'] + pipeline.counts['done'];
  const pctDone = pipelineTotal ? Math.round((pipeline.counts['done']/pipelineTotal)*100) : null;

  if (process.argv.includes('--json')) {
    const json = {
      generated: new Date().toISOString(),
      stories: stories.map(s => ({
        id: `${String(s.number).padStart(2,'0')}-${s.slug}`,
        title: s.title,
        status: s.status,
        backlog: s.backlog
      })),
      pipeline: {
        ...pipeline.counts,
        total: pipelineTotal,
        pctDone,
        lastUpdated: pipeline.latest
      }
    };
    console.log(JSON.stringify(json, null, 2));
    return;
  }

  const lines = [];
  lines.push('# SPEC INDEX');
  lines.push('Generated: ' + new Date().toISOString());
  lines.push('');
  lines.push('## Stories (Backlog Only)');
  lines.push('');
  lines.push('| Story | Title | Status | Backlog |');
  lines.push('|-------|-------|--------|---------|');
  for (const s of stories) {
    const id = `${String(s.number).padStart(2,'0')}-${s.slug}`;
    lines.push(`| ${id} | ${s.title} | ${s.status} | ${s.backlog} |`);
  }
  lines.push('');
  lines.push('## Global Task Pipeline');
  lines.push('');
  lines.push('| Todo | In-Progress | Review | Done | Total | %Done | LastUpdated |');
  lines.push('|------|-------------|--------|------|-------|-------|-------------|');
  lines.push(`| ${pipeline.counts['todo']} | ${pipeline.counts['in-progress']} | ${pipeline.counts['review']} | ${pipeline.counts['done']} | ${pipelineTotal} | ${pctDone === null ? '--' : pctDone + '%'} | ${pipeline.latest} |`);
  lines.push('');
  await fs.writeFile(OUTPUT, lines.join('\n'), 'utf8');
  console.log('Wrote spec index to', OUTPUT);
}

main().catch(err => { console.error(err); process.exit(1); });

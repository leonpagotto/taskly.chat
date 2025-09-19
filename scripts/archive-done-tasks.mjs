#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Archive done tasks older than N days to their originating story archive folder.

Usage:
  node scripts/archive-done-tasks.mjs [--days 14] [--dry]

Rules:
- Task must reside in tasks/done/
- Must contain a Story: field to determine destination story dir
- Destination: docs/taskly-chat/stories/<story>/archive/<filename>
- Creates archive/ if missing.
- Adds provenance entry.
*/

const ROOT = process.cwd();
const DONE_DIR = path.join(ROOT, 'tasks', 'done');
const STORIES_ROOT = path.join(ROOT, 'docs/taskly-chat/stories');

function parseArgs() {
  const args = process.argv.slice(2);
  let days = 14; let dry = false;
  for (let i=0;i<args.length;i++) {
    if (args[i] === '--days') { days = parseInt(args[i+1],10); i++; }
    else if (args[i] === '--dry') dry = true;
  }
  return { days, dry };
}

async function listDoneFiles() {
  try { return (await fs.readdir(DONE_DIR,{withFileTypes:true})).filter(e=>e.isFile() && e.name.endsWith('.md')).map(e=>path.join(DONE_DIR,e.name)); } catch { return []; }
}

async function readMeta(file) {
  const raw = await fs.readFile(file,'utf8');
  const storyMatch = raw.match(/Story:\s*([A-Za-z0-9_-]+)/);
  const updatedMatch = raw.match(/Updated:\s*(\d{4}-\d{2}-\d{2})/);
  return { raw, story: storyMatch ? storyMatch[1] : null, updated: updatedMatch ? updatedMatch[1] : null };
}

function olderThan(dateStr, days) {
  if (!dateStr) return false;
  const then = new Date(dateStr + 'T00:00:00Z').getTime();
  const cutoff = Date.now() - days*24*60*60*1000;
  return then < cutoff;
}

async function archive(file, meta, dry) {
  if (!meta.story) { console.warn('Skip (no story):', file); return; }
  const storyDir = path.join(STORIES_ROOT, meta.story);
  const exists = await fs.access(storyDir).then(()=>true).catch(()=>false);
  if (!exists) { console.warn('Story dir missing for', file); return; }
  const archiveDir = path.join(storyDir, 'archive');
  if (!dry) await fs.mkdir(archiveDir,{recursive:true});
  const dest = path.join(archiveDir, path.basename(file));
  if (dry) {
    console.log('[DRY] archive', file, '->', dest); return;
  }
  let raw = meta.raw;
  const provLine = `- ${new Date().toISOString()} archived→${path.relative(ROOT,dest)}`;
  if (/^Provenance:/m.test(raw)) raw += `\n${provLine}`; else raw += `\n\nProvenance:\n${provLine}`;
  await fs.writeFile(file, raw, 'utf8');
  await fs.rename(file, dest);
  console.log('Archived', file, '->', dest);
}

async function main() {
  const { days, dry } = parseArgs();
  const files = await listDoneFiles();
  for (const f of files) {
    const meta = await readMeta(f);
    if (olderThan(meta.updated, days)) {
      await archive(f, meta, dry);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });

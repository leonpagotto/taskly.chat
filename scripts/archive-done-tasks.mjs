#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Archive done tasks older than N days to their originating story archive folder.

Usage:
  node scripts/archive-done-tasks.mjs [--days 14] [--dry]
  (If --days omitted, uses tasks.config.json archive.defaultRetentionDays)

Rules:
- Task must reside in tasks/done/
- Must contain a Story: field to determine destination story dir
- Destination: docs/taskly-chat/stories/<story>/archive/<filename>
- Creates archive/ if missing.
- Adds provenance entry.
*/

const ROOT = process.cwd();
const CONFIG_FILE = path.join(ROOT,'tasks.config.json');
const DONE_DIR = path.join(ROOT, 'tasks', 'done');
const STORIES_ROOT = path.join(ROOT, 'docs/taskly-chat/stories');

function parseArgs(defaultRetention) {
  const args = process.argv.slice(2);
  let days = defaultRetention || 14; let dry = false;
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

async function archive(file, meta, dry, summary) {
  if (!meta.story) { console.warn('Skip (no story):', file); return; }
  const storyDir = path.join(STORIES_ROOT, meta.story);
  const exists = await fs.access(storyDir).then(()=>true).catch(()=>false);
  if (!exists) { console.warn('Story dir missing for', file); return; }
  const archiveDir = path.join(storyDir, 'archive');
  if (!dry) await fs.mkdir(archiveDir,{recursive:true});
  const dest = path.join(archiveDir, path.basename(file));
  if (dry) {
    console.log('[DRY] archive', file, '->', dest); summary.dry++; return;
  }
  let raw = meta.raw;
  const provLine = `- ${new Date().toISOString()} EVENT:archive to=${path.relative(ROOT,dest)}`;
  if (/^Provenance:/m.test(raw)) raw += `\n${provLine}`; else raw += `\n\nProvenance:\n${provLine}`;
  await fs.writeFile(file, raw, 'utf8');
  await fs.rename(file, dest);
  console.log('Archived', file, '->', dest);
  summary.archived++;
}

async function main() {
  let defaultRetention = 14;
  try {
    const cfgRaw = await fs.readFile(CONFIG_FILE,'utf8');
    const cfg = JSON.parse(cfgRaw);
    if (cfg.archive && cfg.archive.defaultRetentionDays) defaultRetention = cfg.archive.defaultRetentionDays;
  } catch {}
  const { days, dry } = parseArgs(defaultRetention);
  const files = await listDoneFiles();
  const summary = { scanned: files.length, eligible: 0, archived: 0, dry: 0, days };
  for (const f of files) {
    const meta = await readMeta(f);
    if (olderThan(meta.updated, days)) {
      summary.eligible++;
      await archive(f, meta, dry, summary);
    }
  }
  console.log(`Summary: scanned=${summary.scanned} eligible=${summary.eligible} archived=${summary.archived} days=${summary.days} dry=${dry}`);
}

main().catch(err => { console.error(err); process.exit(1); });

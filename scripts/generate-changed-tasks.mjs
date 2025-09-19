#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Generates changed-tasks.json capturing adds / modifications since last run based on SHA256 hashes in tasks.json manifest.
Usage:
  node scripts/generate-changed-tasks.mjs [--base <path>] [--output <path>] [--since <git-ref>] [--full]

Modes:
  1. Snapshot diff mode (default):
     - Reads current tasks.json (must already be regenerated).
     - Reads previous snapshot file (default: .cache/last-tasks.json) if present.
     - Emits changed-tasks.json with arrays: added, modified, removed, unchanged.
  2. Git ref mode (--since <ref>):
     - Loads tasks.json from given git ref (using 'git show <ref>:tasks.json').
     - Diffs against current tasks.json (ignores snapshot file).
  3. Full mode (--full):
     - Forces listing every task under 'all'.

Outputs (default path: changed-tasks.json at repo root):
{
  generated: <iso>,
  baseMode: 'snapshot' | 'git-ref' | 'full',
  since: <git-ref or null>,
  totals: { current, previous, added, modified, removed, unchanged },
  added: [ { id, file, hash } ],
  modified: [ { id, file, oldHash, newHash } ],
  removed: [ { id, file, hash } ],
  unchanged: [ { id, file, hash } ],
  all?: [ { id, file, hash } ] // only when --full
}

On successful generation in snapshot mode the script updates the snapshot cache file for next run.
*/

const ROOT = process.cwd();
const DEFAULT_MANIFEST = path.join(ROOT,'tasks.json');
const CACHE_DIR = path.join(ROOT,'.cache');
const SNAPSHOT_FILE = path.join(CACHE_DIR,'last-tasks.json');

async function readJSON(p){ try { return JSON.parse(await fs.readFile(p,'utf8')); } catch { return null; } }
async function ensureDir(p){ await fs.mkdir(p,{recursive:true}); }

async function readGitRefTasks(ref){
  const { exec } = await import('child_process');
  return new Promise((resolve)=>{
    exec(`git show ${ref}:tasks.json`, {cwd: ROOT}, (err, stdout)=>{
      if (err) return resolve(null);
      try { resolve(JSON.parse(stdout)); } catch { resolve(null); }
    });
  });
}

function indexTasks(manifest){
  const map = new Map();
  if (!manifest || !Array.isArray(manifest.tasks)) return map;
  for (const t of manifest.tasks){
    map.set(t.id, { id: t.id, file: t.file, hash: t.hash });
  }
  return map;
}

async function main(){
  const args = process.argv.slice(2);
  let basePath = DEFAULT_MANIFEST;
  let outputPath = path.join(ROOT,'changed-tasks.json');
  let sinceRef = null;
  let full = false;
  for (let i=0;i<args.length;i++){
    const a = args[i];
    if (a === '--base') basePath = path.resolve(ROOT, args[++i]);
    else if (a === '--output') outputPath = path.resolve(ROOT, args[++i]);
    else if (a === '--since') sinceRef = args[++i];
    else if (a === '--full') full = true;
  }

  const current = await readJSON(basePath);
  if (!current){
    console.error('Unable to read current manifest at', basePath);
    process.exit(1);
  }

  let previous = null;
  let mode = 'snapshot';
  if (sinceRef){
    previous = await readGitRefTasks(sinceRef);
    mode = 'git-ref';
  } else {
    previous = await readJSON(SNAPSHOT_FILE);
  }
  if (full){
    mode = 'full';
  }

  const curIdx = indexTasks(current);
  const prevIdx = indexTasks(previous);

  const added = [];
  const modified = [];
  const removed = [];
  const unchanged = [];

  for (const [id, cur] of curIdx){
    const prev = prevIdx.get(id);
    if (!prev){ added.push(cur); continue; }
    if (prev.hash !== cur.hash){ modified.push({ id, file: cur.file, oldHash: prev.hash, newHash: cur.hash }); }
    else { unchanged.push(cur); }
  }
  for (const [id, prev] of prevIdx){
    if (!curIdx.has(id)) removed.push(prev);
  }

  const doc = {
    generated: new Date().toISOString(),
    baseMode: mode,
    since: mode === 'git-ref' ? sinceRef : null,
    totals: {
      current: curIdx.size,
      previous: prevIdx.size,
      added: added.length,
      modified: modified.length,
      removed: removed.length,
      unchanged: unchanged.length
    },
    added, modified, removed, unchanged
  };
  if (full){
    doc.all = [...curIdx.values()];
  }

  await fs.writeFile(outputPath, JSON.stringify(doc,null,2)+'\n','utf8');
  console.log('Wrote changed tasks diff to', outputPath);

  if (mode === 'snapshot'){
    await ensureDir(CACHE_DIR);
    await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(current,null,2)+'\n','utf8');
    console.log('Updated snapshot at', SNAPSHOT_FILE);
  }
}

main().catch(err=>{ console.error(err); process.exit(1); });

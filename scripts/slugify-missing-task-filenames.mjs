#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/*
Slug migration script.
Find task markdown files whose basename matches /^[A-Z]+-\d+\.md$/ and rename to <ID>-<derived-slug>.md
Slug derivation:
 1. Read file, look for '# Task: <ID>' line; then search for next non-empty line after '## Summary' OR use 'title:' legacy field OR fallback to ID.
 2. Take up to 10 words, lowercase, kebab-case, strip punctuation.
 3. Collapse duplicate dashes; trim leading/trailing dashes.
If a target filename already exists, skip and warn.
After execution you should run:
  node scripts/sync-tasks-manifest.mjs
  node scripts/validate-tasks.mjs
*/

// Derive repo root relative to this script (../)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname,'..');
const STORIES_ROOT = path.join(ROOT,'docs/taskly-chat/stories');
const PIPELINE_ROOT = path.join(ROOT,'tasks');

function isUnslugged(name){
  return /^[A-Z]+-\d+\.md$/.test(name);
}

async function collectFiles(){
  const files = [];
  // story backlogs
  const storyDirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true}).catch(()=>[]);
  for (const d of storyDirs){
    if (!d.isDirectory()) continue;
    const backlog = path.join(STORIES_ROOT,d.name,'Backlog');
    const entries = await fs.readdir(backlog,{withFileTypes:true}).catch(()=>[]);
    for (const e of entries){
      if (e.isFile() && isUnslugged(e.name)) files.push(path.join(backlog,e.name));
    }
  }
  // pipeline statuses
  for (const st of ['todo','in-progress','review','done','in-progress','done']){
    const dir = path.join(PIPELINE_ROOT, st);
    const entries = await fs.readdir(dir,{withFileTypes:true}).catch(()=>[]);
    for (const e of entries){
      if (e.isFile() && isUnslugged(e.name)) files.push(path.join(dir,e.name));
    }
  }
  return files;
}

function toSlug(text){
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'')
    .trim()
    .split(/\s+/)
    .slice(0,6)
    .join('-')
    .replace(/-+/g,'-')
    .replace(/^-|-$/g,'');
}

function deriveSlug(raw, id){
  // Try Summary section first
  const summaryMatch = raw.split(/\n## Summary\n/i)[1];
  if (summaryMatch){
    const line = summaryMatch.split(/\n/).find(l=>l.trim());
    if (line){
      const s = toSlug(line);
      if (s && s !== id.toLowerCase()) return s;
    }
  }
  // Fallback: legacy 'title:' line
  const titleLine = raw.match(/^title:\s*(.+)$/mi);
  if (titleLine){
    const s = toSlug(titleLine[1]);
    if (s && s !== id.toLowerCase()) return s;
  }
  // Fallback: first non-empty line after '# Task: ID' header block
  const headerRegex = new RegExp(`# Task:\\s*${id}\\b`, 'i');
  const headerIndex = raw.search(headerRegex);
  if (headerIndex !== -1){
    const tail = raw.slice(headerIndex).split(/\n/).slice(1); // lines after header line
    for (const line of tail){
      if (!line.trim()) continue;
      if (/^Status:/i.test(line)) continue; // skip metadata lines
      if (/^Story:/i.test(line)) continue;
      if (/^Created:/i.test(line)) continue;
      const s = toSlug(line);
      if (s && s !== id.toLowerCase()) return s;
      break;
    }
  }
  return 'task';
}

async function main(){
  const files = await collectFiles();
  if (!files.length){
    console.log('No unslugged files found.');
    return;
  }
  const actions = [];
  for (const file of files){
    const raw = await fs.readFile(file,'utf8');
    const id = path.basename(file).replace(/\.md$/,'');
    const slug = deriveSlug(raw, id);
    const target = path.join(path.dirname(file), `${id}-${slug}.md`);
    if (target === file){
      continue;
    }
    try {
      await fs.access(target); // exists
      console.warn('Skip (target exists):', target);
      continue;
    } catch {}
    await fs.rename(file, target);
    actions.push({from: path.relative(ROOT,file), to: path.relative(ROOT,target)});
  }
  if (!actions.length){
    console.log('No renames performed (maybe all already slugged).');
    return;
  }
  console.log('Renamed', actions.length, 'files');
  for (const a of actions){
    console.log('-', a.from, '=>', a.to);
  }
  console.log('\nNext steps:');
  console.log('  node scripts/sync-tasks-manifest.mjs');
  console.log('  node scripts/validate-tasks.mjs');
}

main().catch(err=>{console.error(err); process.exit(1);});

#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Ensures task filenames follow <ID>-<kebab-slug>.md
Where ID = existing filename prefix up to first non-alnum-hyphen block; slug derived from title line '# Task: ...'
Dry run by default. Use --write to apply.
*/
const ROOT = process.cwd();
const STORIES_ROOT = path.join(ROOT,'stories');
const PIPELINE_ROOT = path.join(ROOT,'tasks');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
}

async function listMarkdown() {
  const files = [];
  const storyDirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true}).catch(()=>[]);
  for (const d of storyDirs) {
    if (!d.isDirectory() || !/^\d+-.+/.test(d.name)) continue;
    for (const sub of ['Backlog']) { // future extend if needed
      const dir = path.join(STORIES_ROOT,d.name,sub);
      try {
        const entries = await fs.readdir(dir,{withFileTypes:true});
        for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) files.push(path.join(dir,e.name));
      } catch {}
    }
  }
  for (const st of ['todo','in-progress','review','done']) {
    const dir = path.join(PIPELINE_ROOT, st);
    try {
      const entries = await fs.readdir(dir,{withFileTypes:true});
      for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) files.push(path.join(dir,e.name));
    } catch {}
  }
  return files;
}

async function main() {
  const write = process.argv.includes('--write');
  const files = await listMarkdown();
  for (const file of files) {
    const raw = await fs.readFile(file,'utf8');
    const titleLine = raw.split(/\r?\n/).find(l=>l.startsWith('# Task:')) || '';
    const title = titleLine.replace('# Task:','').trim();
    if (!title) continue;
    const id = path.basename(file).replace(/\.md$/,'').split(/[^A-Za-z0-9_-]/)[0];
    const expected = id + '-' + slugify(title) + '.md';
    const current = path.basename(file);
    if (current !== expected) {
      const dest = path.join(path.dirname(file), expected);
      if (write) {
        await fs.rename(file, dest);
        console.log('Renamed', current, '->', expected);
      } else {
        console.log('[DRY] would rename', current, '->', expected);
      }
    }
  }
  if (!write) console.log('Dry run complete. Re-run with --write to apply changes.');
}

main().catch(err => { console.error(err); process.exit(1); });

#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Migrates old per-story status folders (Backlog/InProgress/Review/Done) into new model:
 - Backlog tasks remain (or are moved into stories/<story>/tasks if desired future enhancement)
 - InProgress -> tasks/in-progress
 - Review -> tasks/review
 - Done -> tasks/done
 - Backlog -> left in place (for now)

Run dry run:
  node scripts/migrate-task-structure.mjs --dry
Execute:
  node scripts/migrate-task-structure.mjs
*/

const STORIES_ROOT = path.resolve(process.cwd(),'docs/taskly-chat/stories');
const PIPELINE_ROOT = path.resolve(process.cwd(),'tasks');
const MAP = new Map([
  ['InProgress','in-progress'],
  ['Review','review'],
  ['Done','done']
]);

const DRY = process.argv.includes('--dry');

async function listStories() {
  const dirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true});
  return dirs.filter(d=>d.isDirectory() && /^\d+-.+/.test(d.name)).map(d=>d.name);
}

async function migrate() {
  const stories = await listStories();
  const actions = [];
  for (const story of stories) {
    for (const [legacy, target] of MAP.entries()) {
      const legacyDir = path.join(STORIES_ROOT, story, legacy);
      try {
        const entries = await fs.readdir(legacyDir,{withFileTypes:true});
        for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) {
          const src = path.join(legacyDir,e.name);
          const destDir = path.join(PIPELINE_ROOT, target);
          await fs.mkdir(destDir,{recursive:true});
          const dest = path.join(destDir, e.name);
          actions.push({src,dest});
        }
      } catch {}
    }
  }
  if (!actions.length) { console.log('No legacy tasks to migrate.'); return; }
  for (const {src,dest} of actions) {
    if (DRY) {
      console.log('[DRY] would move', path.relative(process.cwd(),src),'->',path.relative(process.cwd(),dest));
    } else {
      let raw = await fs.readFile(src,'utf8');
      raw = raw.replace(/^Status:\s*InProgress$/m,'Status: in-progress')
               .replace(/^Status:\s*Review$/m,'Status: review')
               .replace(/^Status:\s*Done$/m,'Status: done');
      // Normalize backlog to lowercase if encountered
      raw = raw.replace(/^Status:\s*Backlog$/m,'Status: backlog');
      await fs.writeFile(src,raw,'utf8');
      await fs.rename(src,dest);
      console.log('Moved', path.relative(process.cwd(),src),'->',path.relative(process.cwd(),dest));
    }
  }
}

migrate().catch(e=>{console.error(e);process.exit(1);});

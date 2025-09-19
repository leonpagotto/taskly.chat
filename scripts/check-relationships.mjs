#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const STORIES_ROOT = path.resolve(process.cwd(),'docs/taskly-chat/stories');

async function listStories() {
  const dirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true});
  const map = new Map();
  for (const d of dirs) if (d.isDirectory()) map.set(d.name, path.join(STORIES_ROOT,d.name));
  return map;
}

function extractRefs(content) {
  const storyRefs = [...content.matchAll(/\[story:([\w-]+)\]/g)].map(m=>m[1]);
  const taskRefs = [...content.matchAll(/\[task:([\w/.-]+)\]/g)].map(m=>m[1]);
  return { storyRefs, taskRefs };
}

async function gatherFiles() {
  const out=[];
  const stack=[STORIES_ROOT];
  while (stack.length) {
    const dir=stack.pop();
    const entries=await fs.readdir(dir,{withFileTypes:true});
    for (const e of entries) {
      const full=path.join(dir,e.name);
      if (e.isDirectory()) stack.push(full); else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
    }
  }
  return out;
}

async function main() {
  const stories = await listStories();
  const files = await gatherFiles();
  const storyIds = new Set(stories.keys());
  // Build task id index: <story-number>/<task-file-name without .md>
  const taskIds = new Set();
  for (const sid of storyIds) {
    for (const status of ['Backlog','InProgress','Review','Done']) {
      const statusDir = path.join(STORIES_ROOT,sid,status);
      try {
        const entries = await fs.readdir(statusDir,{withFileTypes:true});
        for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) {
          const base = e.name.replace(/\.md$/,'');
            taskIds.add(`${sid}/${status}/${base}`);
        }
      } catch {}
    }
  }
  let unresolvedStories=0, unresolvedTasks=0, missingReciprocal=0;
  for (const file of files) {
    const raw = await fs.readFile(file,'utf8');
    const { storyRefs, taskRefs } = extractRefs(raw);
    for (const sr of storyRefs) if (!storyIds.has(sr)) { console.error(`Unresolved story ref ${sr} in ${file}`); unresolvedStories++; }
    for (const tr of taskRefs) if (!taskIds.has(tr)) { console.error(`Unresolved task ref ${tr} in ${file}`); unresolvedTasks++; }
    // Reciprocal check (only for story refs referencing tasks?) Keeping simple: skip for now
  }
  if (unresolvedStories || unresolvedTasks) {
    console.error(`Validation failed: unresolved stories=${unresolvedStories}, tasks=${unresolvedTasks}`);
    process.exit(2);
  }
  console.log('Relationship check passed.');
}

main().catch(e=>{console.error(e);process.exit(1);});

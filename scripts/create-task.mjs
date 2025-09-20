#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Create a new backlog task file within a story.
Usage:
  node scripts/create-task.mjs <story-folder> "Title of Task" [--type feature] [--priority medium]

Determines next numeric ID within story by scanning existing backlog + pipeline tasks referencing the story.
Filename: <ID>-<kebab-title>.md
*/

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
}

const ROOT = process.cwd();
const STORIES_ROOT = path.join(ROOT,'stories');
const PIPELINE_ROOT = path.join(ROOT,'tasks');

async function collectExistingIds(story) {
  const ids = new Set();
  const storyDir = path.join(STORIES_ROOT, story, 'Backlog');
  try {
    const entries = await fs.readdir(storyDir,{withFileTypes:true});
    for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) ids.add(e.name.split('-')[0]);
  } catch {}
  for (const st of ['todo','in-progress','review','done']) {
    const dir = path.join(PIPELINE_ROOT, st);
    try {
      const entries = await fs.readdir(dir,{withFileTypes:true});
      for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) {
        // naive story detection by content scan to ensure uniqueness if belongs to story
        const file = path.join(dir,e.name);
        try {
          const raw = await fs.readFile(file,'utf8');
          if (raw.includes(`Story: ${story}`)) ids.add(e.name.split('-')[0]);
        } catch {}
      }
    } catch {}
  }
  return ids;
}

function nextId(existing) {
  let max = 0;
  for (const id of existing) {
    const n = parseInt(id.replace(/[^0-9]/g,''),10);
    if (!isNaN(n) && n > max) max = n;
  }
  const next = (max+1).toString().padStart(3,'0');
  return next;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/create-task.mjs <story-folder> "Title" [--type feature] [--priority medium]');
    process.exit(1);
  }
  const story = args[0];
  const title = args[1];
  const typeFlag = args.indexOf('--type');
  const priorityFlag = args.indexOf('--priority');
  const type = typeFlag !== -1 ? args[typeFlag+1] : 'feature';
  const priority = priorityFlag !== -1 ? args[priorityFlag+1] : 'medium';
  const storyDir = path.join(STORIES_ROOT, story);
  const exists = await fs.access(storyDir).then(()=>true).catch(()=>false);
  if (!exists) { console.error('Story folder not found:', storyDir); process.exit(1); }
  const backlogDir = path.join(storyDir,'Backlog');
  await fs.mkdir(backlogDir,{recursive:true});
  const existing = await collectExistingIds(story);
  const id = nextId(existing);
  const slug = slugify(title);
  const filename = `${id}-${slug}.md`;
  const filePath = path.join(backlogDir, filename);
  const today = new Date().toISOString().slice(0,10);
  // Try template
  let contentTemplate = null;
  const templatePath = path.join(ROOT,'templates','task.template.md');
  try { contentTemplate = await fs.readFile(templatePath,'utf8'); } catch {}
  let content;
  if (contentTemplate) {
    contentTemplate = contentTemplate
      .replace('<TASK_ID>', `${id}`)
      .replace('Status: Backlog', 'Status: Backlog')
      .replace('<story-slug|NONE>', story)
      .replace('<YYYY-MM-DD>', today)
      .replace('feature', type)
      .replace('<Short imperative description of work.>', 'TODO')
      .replace('<Testable condition>', 'Criterion 1');
    content = contentTemplate.replace('<Key architectural or sequencing details>', '');
  } else {
    content = `# Task: ${id}\nStatus: Backlog\nStory: ${story}\nCreated: ${today}\nType: ${type}\nRelated: story:${story}\nOwner: system\n\n## Summary\nTODO\n\n## Acceptance Criteria\n- [ ] Criterion 1\n\n## Implementation Notes\n\n## Progress Log\n- ${today} Created via create-task script\n`;
  }
  await fs.writeFile(filePath, content,'utf8');
  console.log('Created task', path.relative(ROOT,filePath));
}

main().catch(err => { console.error(err); process.exit(1); });
